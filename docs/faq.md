# 常见问题（FAQ）

## 安装与启用

### 安装后消息没有任何变化？

请按以下顺序排查：

1. 确认 LiteLoaderQQNT 已正确安装并正常运行（进入 QQ 设置，确认左侧出现「LiteLoader」入口）。
2. 确认插件已安装到正确路径：LiteLoader 数据目录 → `plugins/markdown-it/`，该目录下应存在 `manifest.json` 和 `dist/` 文件夹。
3. 完全退出并重启 QQ。
4. 打开 DevTools 控制台（Ctrl+Shift+I），查看是否有以 `[MarkdownIt]` 开头的错误输出。

---

### 插件设置页面找不到？

进入 QQ 设置 → LiteLoader → 插件列表，找到「Markdown-it」后点击进入其设置页。若插件列表中没有该条目，说明插件未正确安装。

---

## 渲染问题

### 消息内容变成乱码或 HTML 标签？

可能原因：

- **QQ 版本更新**导致消息 DOM 结构变化，选择器失效。请查阅 [已知问题](./known_issue.md)，并 [提交 Issue](https://github.com/BegoniaHe/LiteLoaderQQNT-Markdown/issues/new)。
- **多个插件冲突**，尝试逐一禁用其他插件排查。

---

### LaTeX 公式不渲染，显示为原始 `$...$` 文本？

1. 确认公式语法正确，可在 [KaTeX 官网](https://katex.org/) 测试验证。
2. 某些特殊字符（如 `<`、`>`、`&`）在 QQ 消息中会被 HTML 转义，可尝试开启插件设置中的「反转义 `>` 字符」选项。

---

### 代码块主题不跟随系统深色/浅色模式？

进入插件设置页，确认「代码高亮主题跟随系统」选项已开启。开关切换后无需重启 QQ，立即生效。

---

### 启用「允许渲染自定义 HTML」后出现安全提示？

这是正常行为。启用该功能后，插件会强制开启「HTML 净化」（DOMPurify）以过滤危险标签。若你发现某些合法 HTML 被错误过滤，可提交 Issue 说明具体场景。

---

### 代码块中的 HTML 实体（如 `&lt;`）显示不正确？

可尝试开启「代码块渲染前反转义」选项（`unescapeBeforeHighlight`）。该选项会在代码高亮前先反转义 HTML 实体，通常能解决此类问题。

---

## 性能问题

### 大量消息时 QQ 变卡？

本插件已使用防抖（debounce）优化渲染触发频率，且通过 WeakSet 避免重复渲染。如果仍感觉卡顿，可以：

1. 确认是否安装了其他占用资源的插件。
2. 提交 Issue 并描述消息数量级和卡顿场景，以便进一步优化。

---

## 调试与反馈

### 如何获取调试信息？

请参考 [调试指南](./debugging.md)。

### 如何反馈问题？

请在 [GitHub Issues](https://github.com/BegoniaHe/LiteLoaderQQNT-Markdown/issues/new) 提交，并附上：

- 操作系统版本
- QQNT 版本
- LiteLoaderQQNT 版本（设置页截图）
- 已安装的插件列表
- 问题复现步骤
- DevTools 控制台截图（如有报错）
