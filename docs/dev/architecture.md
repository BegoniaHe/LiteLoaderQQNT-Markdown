# 项目架构

本文档面向希望参与贡献或深入了解本插件实现细节的开发者。

---

## 技术栈

| 技术 | 用途 |
|------|------|
| TypeScript | 主要开发语言，开启 `strict` 模式 |
| React + TSX | 设置页 UI 及组件开发 |
| Webpack | 打包构建（开发/生产双配置） |
| markdown-it | Markdown 解析与渲染核心 |
| KaTeX | LaTeX 公式渲染 |
| highlight.js | 代码块语法高亮 |
| DOMPurify | HTML 净化（XSS 防护） |
| Zustand + immer | 状态管理与持久化 |

---

## Electron 三进程架构

本插件运行在 LiteLoaderQQNT 提供的 Electron 环境中，严格划分三个进程职责：

### 主进程（`src/main.ts`）

- 入口：`onBrowserWindowCreated(window)`
- 职责：监听 QQNT 窗口创建事件，向渲染进程注入 preload 脚本和渲染脚本
- 不直接操作 DOM

### 预加载脚本（`src/preload.ts`）

- 运行在渲染进程的隔离上下文中
- 职责：通过 `contextBridge` 向页面暴露受限的 IPC 接口（如设置读写）
- 不直接执行渲染逻辑

### 渲染进程（`src/renderer.tsx`）

- 插件的核心运行环境，直接操作页面 DOM
- 职责：
  - 通过 `MutationObserver` 监听消息列表变化
  - 触发防抖后的 `render()` 函数
  - 调用消息片段处理器完成 Markdown 渲染
  - 注入 CSS 样式、初始化设置监听

---

## 目录结构

```
src/
├── main.ts                   # 主进程入口
├── preload.ts                # 预加载脚本
├── renderer.tsx              # 渲染进程入口与核心调度
├── config.ts                 # 全局常量（CSS 选择器、类名、性能参数）
├── common/
│   └── constants.ts          # 共享常量
├── components/
│   ├── setting_page.tsx      # 插件设置页 React 组件
│   ├── code_block.tsx        # 代码块后处理（高度方向调整）
│   └── show_origin.tsx       # 「显示原始内容」按钮组件
├── render/
│   ├── msgpiece_processor.tsx  # 消息片段处理器（渲染核心）
│   └── postprocess.ts          # 渲染后处理（外链绑定等）
├── states/
│   └── settings.ts           # Zustand 状态管理与持久化
├── style/                    # 注入的 CSS 样式文件
├── types/
│   ├── global.d.ts           # LiteLoader API 类型声明
│   └── markdown-it-plugins.d.ts  # 第三方插件类型补充
└── utils/
    ├── htmlProc.ts           # HTML 净化工具（DOMPurify 封装）
    ├── url.ts                # 外链协议白名单校验
    ├── logger.ts             # 渲染进程日志工具（mditLogger）
    ├── logger_main.ts        # 主进程日志工具
    ├── liteloader_config.ts  # LiteLoader 配置读写封装
    └── liteloader_type.ts    # LiteLoader 平台类型定义
```

---

## 本地开发

克隆项目后，先安装依赖：

```bash
npm ci
```

### 开发模式（实时构建）

```bash
npm run dev
```

Webpack 以 `watch` + `development` 模式运行，文件变更后自动重新构建。在 QQNT 中按 `Ctrl+Shift+R` 刷新渲染进程即可看到最新效果。

### 生产构建

```bash
npm run build
```

### 打包发布

```bash
npm run release
```

该命令依次执行：
1. `npm run build` — 生成 `dist/` 资源
2. `git archive` — 打包所有受 git 追踪的文件为 `release.zip`
3. `zip -r` — 将 `dist/` 目录追加进 `release.zip`

### 代码检查

```bash
npm run check       # 同时执行 lint + type-check
npm run lint        # ESLint 检查
npm run type-check  # TypeScript 类型检查
```

---

## 日志工具

在渲染进程中，使用 `mditLogger` 代替 `console.log`：

```typescript
import { mditLogger } from '@/utils/logger';

mditLogger('debug', '调试信息');   // 输出：[MarkdownIt] 调试信息
mditLogger('error', '错误信息', e);
```

日志输出受设置项 `consoleOutput` 控制，用户可在设置页关闭。

---

## 延伸阅读

- [渲染流程详解](./rendering_pipeline.md)
- [安全机制说明](./security.md)
