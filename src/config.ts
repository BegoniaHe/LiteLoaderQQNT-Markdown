/**
 * 统一配置文件
 * 集中管理所有常量、选择器、魔法数字等配置项
 *
 * 优点：
 * 1. 便于维护：所有配置集中在一处
 * 2. 易于适配：QQNT 更新时只需修改此文件
 * 3. 类型安全：TypeScript 提供类型检查
 */

// 导入共享常量（与 preload 共享）
export { IPC_CHANNELS, PLUGIN_CONFIG } from "@/common/constants";

/**
 * DOM 选择器常量
 * QQNT DOM 结构相关的选择器
 */
export const SELECTORS = {
    /** 消息内容容器 */
    MESSAGE_CONTENT: ".message-content",

    /** 文本元素类名 */
    TEXT_ELEMENT: "text-element",

    /** 图片元素类名 */
    IMG_ELEMENT: "pic-element",

    /** @ 提及元素选择器 */
    AT_ELEMENT: ".text-element--at",

    /** 消息块内部容器 */
    MIX_MESSAGE_INNER: ".mix-message__inner",

    /** 代码块复制按钮 */
    CODE_COPY_BUTTON: "pre.hl-code-block>button.lang_copy",

    /** LaTeX 块复制按钮 */
    LATEX_COPY_BUTTON: "div.katex-block-rendered>button.copy_latex",

    /** LaTeX 注释元素 */
    LATEX_ANNOTATION: 'annotation[encoding="application/x-tex"]',
} as const;

/**
 * CSS 类名常量
 */
export const CLASS_NAMES = {
    /** 标记已渲染的消息 */
    MARKDOWN_RENDERED: "markdown-rendered",

    /** 标记被忽略的消息片段 */
    MARKDOWN_IGNORED: "mdit-ignored",

    /** 片段处理器处理标记前缀 */
    HANDLED_BY_PROCESSOR_PREFIX: "markdown-it-handled-as-",

    /** Markdown 链接 */
    MARKDOWN_LINK: "markdown_it_link",

    /** 文本链接 */
    TEXT_LINK: "text-link",

    /** 高亮代码块 */
    HL_CODE_BLOCK: "hl-code-block",

    /** Markdown-it 围栏代码块 */
    MDIT_FENCED_CODE_BLOCK: "mdit-fenced-code-block",

    /** 显示原始内容按钮 */
    SHOW_ORIGIN_BUTTON: "mdit-show-origin-button",
} as const;

/**
 * Data 属性常量
 * 用于更可靠的元素标记
 */
export const DATA_ATTRIBUTES = {
    /** 标记已渲染的消息（更可靠的方式） */
    RENDERED: "data-mdit-rendered",

    /** 标记渲染时间戳 */
    RENDERED_TIME: "data-mdit-rendered-time",
} as const;

/**
 * 性能相关配置
 */
export const PERFORMANCE = {
    /** 防抖延迟时间（毫秒） - 控制渲染函数触发频率 */
    DEBOUNCE_DELAY: 50,

    /** 消息高度阈值（像素） - 超过此高度改为列布局 */
    MESSAGE_HEIGHT_THRESHOLD: 35,
} as const;

/**
 * CSS 资源 ID
 */
export const CSS_IDS = {
    /** GitHub 暗色主题 */
    GITHUB_HL_DARK: "github-hl-dark",

    /** GitHub 自适应主题 */
    GITHUB_HL_ADAPTIVE: "github-hl-adaptive",
} as const;

/**
 * Markdown-it 配置
 */
export const MARKDOWN_CONFIG = {
    /** 语言前缀 */
    LANG_PREFIX: "language-",

    /** 引号样式 */
    QUOTES: "\"\"''",
} as const;

/**
 * 类型导出
 */
export type SelectorKey = keyof typeof SELECTORS;
export type ClassNameKey = keyof typeof CLASS_NAMES;
export type DataAttributeKey = keyof typeof DATA_ATTRIBUTES;
