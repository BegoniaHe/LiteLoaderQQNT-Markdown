# 已知问题

本文件记录当前版本中已确认存在、尚未完全解决的问题。

---

## HTML 净化默认关闭

**影响版本**：所有版本  
**状态**：设计决策，建议用户手动开启

`启用 HTML 净化`（`enableHtmlPurify`）选项默认为关闭状态。如果你启用了「允许渲染自定义 HTML」功能，强烈建议同时开启净化选项，以避免潜在的 XSS 注入风险。

> 安全约束：当「允许渲染自定义 HTML」开启时，插件会强制联动开启 HTML 净化，无需手动操作。但当「允许渲染自定义 HTML」关闭时，净化默认不强制启用。

---

## QQ 版本更新导致消息选择器失效

**影响版本**：不确定，取决于 QQNT 版本  
**状态**：跟踪中

本插件通过 CSS 选择器定位消息元素（见 `src/config.ts` 中的 `SELECTORS`）。QQNT 更新后若修改了消息 DOM 结构，可能导致插件无法识别消息元素，表现为：

- 消息不再渲染 Markdown
- 控制台出现选择器相关警告

遇到此问题请 [提交 Issue](https://github.com/BegoniaHe/LiteLoaderQQNT-Markdown/issues/new) 并附上当前 QQNT 版本号。

---

## 部分样式与第三方主题冲突

**影响版本**：不确定，取决于主题  
**状态**：跟踪中

本插件注入的 Markdown 样式（`src/style/markdown.css`）在特定第三方主题下可能出现字体、间距或颜色冲突。目前尚无通用解决方案，建议在主题的 Issue 区或本插件 Issue 区报告具体冲突情况。

---

## 通过插件列表安装时报错 `boolean false is not iterable`

**影响版本**：LiteLoaderQQNT 部分版本 + 本插件旧 slug（`markdown_it`）  
**状态**：已在插件侧规避（slug 迁移到 `markdown_it_v4`）

该错误来自 LiteLoaderQQNT 安装流程中的删除逻辑类型不匹配，并非本插件压缩包结构问题。

若你此前安装过旧版本，请先卸载旧版本（或手动删除旧目录 `markdown_it`）后再安装当前版本。
