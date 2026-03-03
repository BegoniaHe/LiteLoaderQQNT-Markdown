# 安全机制说明

本插件处理用户消息时涉及 HTML 解析与渲染，本文档说明各层安全措施的设计与配置。

---

## 安全威胁背景

QQNT 消息内容通过 `innerHTML` 读取，其中包含浏览器已转义的 HTML 实体（如 `&gt;`、`&lt;`）。在将内容传入 markdown-it 渲染之前，部分场景需要反转义这些实体，而反转义后直接渲染会引入 XSS 注入风险。因此本插件构建了**多层安全防线**。

---

## 安全分层架构

### 第一层：精细化 HTML 实体反转义

配置项位于 `src/states/settings.ts`，由用户按需开启：

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `unescapeGtInText` | 仅反转义文本中的 `&gt;` → `>`（解决块引用渲染问题） | `true` |
| `unescapeBeforeHighlight` | 代码高亮前反转义全部 HTML 实体 | `true` |
| `unescapeAllHtmlEntites` | 渲染前反转义全部 HTML 实体（启用自定义 HTML 时使用） | `false` |

精细化反转义遵循**最小权限原则**：仅反转义渲染所必须的字符，不做过度开放。

---

### 第二层：DOMPurify HTML 净化（`src/utils/htmlProc.ts`）

本插件封装了两个净化函数：

- **`purifyHtml(html)`**：对 markdown-it 渲染输出进行完整净化，过滤所有危险标签和属性。
- **`purifyCodeHighlightHtml(html)`**：对 highlight.js 高亮后的代码块 HTML 进行净化，二次防护。

净化配置当前允许 `style` 属性通过（用于支持 KaTeX 公式等合法样式需求），未来可按需收紧白名单。

**触发条件**：`enableHtmlPurify` 设置为 `true` 时启用。

---

### 第三层：安全联动约束（`src/states/settings.ts`）

在 `updateSetting()` 中实现了双向约束逻辑：

```typescript
// 启用完全反转义时，强制开启 HTML 净化
if (key === 'unescapeAllHtmlEntites' && value === true) {
    state.enableHtmlPurify = true;
}

// 禁用 HTML 净化时，强制禁用完全反转义
if (key === 'enableHtmlPurify' && value === false) {
    state.unescapeAllHtmlEntites = false;
}
```

此约束确保用户无法同时启用「完全反转义」和「关闭净化」，避免高风险配置组合。

对应的运行时强制函数：

- `forceEnableHtmlPurify()`：当 `unescapeAllHtmlEntites === true` 时，强制净化开启，无视存储值
- `forceUnescapeBeforeHighlight()`：当 `unescapeAllHtmlEntites === true` 时，强制禁用代码块再次反转义（避免双重反转义）

---

### 第四层：外链协议白名单（`src/utils/url.ts`）

函数 `sanitizeExternalUrl(url)` 在打开外部链接前进行协议校验：

- 仅允许 `http://`、`https://` 等安全协议
- 拒绝 `javascript:`、`file://` 等危险协议

该校验在 `src/render/postprocess.ts` 的后处理阶段绑定到所有渲染后的链接元素。

---

## 配置风险等级速查

| 配置组合 | 风险等级 | 说明 |
|---------|---------|------|
| 默认配置（所有高危选项关闭） | 低 | 仅反转义 `>`，代码块高亮前反转义，净化关闭但无全量反转义 |
| `unescapeAllHtmlEntites=true`（自动联动 `enableHtmlPurify=true`） | 中 | 启用自定义 HTML 渲染，DOMPurify 净化兜底 |
| 手动开启 `enableHtmlPurify=true` | 低 | 额外净化层，安全性提升 |
| `enableHtmlPurify=false`（且 `unescapeAllHtmlEntites=false`） | 低 | 无全量反转义，净化虽未启用但攻击面有限 |

---

## 注意事项

- 本插件**不建议**在不受信任的公开群聊中启用「允许渲染自定义 HTML」功能，即使开启了净化，DOMPurify 的 `style` 白名单仍可能被用于 UI 混淆攻击。
- 如发现潜在安全漏洞，请优先通过 [GitHub Issues](https://github.com/BegoniaHe/LiteLoaderQQNT-Markdown/issues/new) 报告，勿在公开渠道披露具体利用细节。

---

## 延伸阅读

- [项目架构](./architecture.md)
- [渲染流程详解](./rendering_pipeline.md)
