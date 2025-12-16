import React from "react";
import hljs from "highlight.js";
import type MarkdownIt from "markdown-it";
type Token = MarkdownIt.Token;
type Renderer = MarkdownIt.Renderer;
type Options = MarkdownIt.Options;

import { unescapeHtml, escapeHtml, purifyCodeHighlightHtml } from "@/utils/htmlProc";
import { useSettingsStore } from "@/states/settings";
import { mditLogger } from "@/utils/logger";
import { CLASS_NAMES, SELECTORS, PERFORMANCE } from "@/config";

/**
 * HighLightedCodeBlock 组件属性
 */
interface HighLightedCodeBlockProps {
    content: string;
    lang: string;
    markdownItIns: MarkdownIt;
}

/**
 * 高亮代码块组件
 * 使用 highlight.js 进行语法高亮
 */
export function HighLightedCodeBlock({
    content,
    lang,
    markdownItIns: _markdownItIns,
}: HighLightedCodeBlockProps) {

    // 显示用语言标签：尽量保留原始 lang
    const displayLang = lang || "plaintext";

    // 高亮用语言：仅在 hljs 支持时启用，否则降级为 plaintext
    const highlightLang = lang && hljs.getLanguage(lang) ? lang : "plaintext";

    /**
     * 代码内容预处理
     * 根据设置决定是否反转义 HTML 实体
     */
    function contentPreprocess(input: string): string {
        // 如果启用了完全反转义，跳过代码块反转义以避免显示错误
        if (useSettingsStore.getState().forceUnescapeBeforeHighlight() === false) {
            return input;
        }

        if (useSettingsStore.getState().unescapeBeforeHighlight === true) {
            return unescapeHtml(input);
        }

        return input;
    }

    let finalContent = "";
    try {
        finalContent = hljs.highlight(contentPreprocess(content), {
            language: highlightLang,
            ignoreIllegals: true,
        }).value;

        // highlight.js 输出为 HTML 字符串，这里再做一次严格白名单净化
        // 仅保留 span/br + class，避免意外属性/标签进入 DOM
        finalContent = purifyCodeHighlightHtml(finalContent);
    } catch (e) {
        mditLogger("error", `hljs error:`, e);
    }

    return (
        <pre className={`hljs ${CLASS_NAMES.HL_CODE_BLOCK} ${CLASS_NAMES.MDIT_FENCED_CODE_BLOCK}`}>
            <button className="lang_copy">
                <p className="lang">{displayLang}</p>
                <p className="copy">复制</p>
            </button>
            <code dangerouslySetInnerHTML={{ __html: finalContent }}></code>
        </pre>
    );
}

/**
 * 渲染内联代码块字符串
 * markdown-it 渲染器函数
 */
export function renderInlineCodeBlockString(
    tokens: Token[],
    idx: number,
    _options: Options,
    _env: unknown,
    slf: Renderer
): string {
    const token = tokens[idx];

    // 如果启用了完全反转义，需要转义代码内容防止 HTML 注入
    if (useSettingsStore.getState().unescapeAllHtmlEntites === true) {
        token.content = escapeHtml(token.content);
    }

    return "<code" + slf.renderAttrs(token) + ">" + token.content + "</code>";
}

/**
 * 为所有复制按钮添加点击处理器
 * 直接修改接收的 HTML 元素
 *
 * @param element - 包含代码块的 HTML 元素
 */
export function addOnClickHandleForCopyButton(element: HTMLElement): void {
    const buttons = element.querySelectorAll(SELECTORS.CODE_COPY_BUTTON);

    Array.from(buttons).forEach((copyButton) => {
        try {
            // 获取代码块内容
            const codeElement = copyButton.parentElement?.querySelector("code");
            if (!codeElement?.textContent) return;

            const codeContent = codeElement.textContent;
            (copyButton as HTMLElement).onclick = () => {
                navigator.clipboard.writeText(codeContent);
            };
        } catch (e) {
            mditLogger("error", "Failed to add click handler for copy button:", e);
        }
    });
}

/**
 * 为 LaTeX 块的复制按钮添加处理器
 *
 * @param element - 包含 LaTeX 块的 HTML 元素
 */
export function addOnClickHandleForLatexBlock(element: HTMLElement): void {
    const buttons = element.querySelectorAll(SELECTORS.LATEX_COPY_BUTTON);

    Array.from(buttons).forEach((copyButton) => {
        try {
            // 查找 LaTeX 注释元素
            const latexAnnoElement = copyButton.parentElement?.querySelector(
                SELECTORS.LATEX_ANNOTATION
            );
            if (!latexAnnoElement?.textContent) return;

            const latexAnno = latexAnnoElement.textContent;
            (copyButton as HTMLElement).onclick = () => {
                navigator.clipboard.writeText(latexAnno);
            };
        } catch (e) {
            mditLogger("error", "Failed to add click handler for LaTeX copy button:", e);
        }
    });
}

/**
 * 当消息高度超过阈值时，将布局改为列布局
 * 优化长消息的显示效果
 * 
 * Performance optimization: use class name to mark and avoid repeated processing
 */
export function changeDirectionToColumnWhenLargerHeight(): void {
    const msgBlocks = document.querySelectorAll(SELECTORS.MIX_MESSAGE_INNER);

    Array.from(msgBlocks).forEach((block) => {
        const htmlBlock = block as HTMLElement;
        
        // Performance optimization: skip already processed message blocks
        if (htmlBlock.classList.contains(CLASS_NAMES.LAYOUT_ADJUSTED)) {
            return;
        }

        const height = htmlBlock.offsetHeight;
        mditLogger("debug", "Detected messagebox height:", height);

        // 当消息高度超过阈值时，改为列布局
        if (height > PERFORMANCE.MESSAGE_HEIGHT_THRESHOLD) {
            htmlBlock.style.flexDirection = "column";
        } else {
            htmlBlock.style.flexDirection = "row";
        }
        
        // 标记为已处理，避免下次重复检查
        htmlBlock.classList.add(CLASS_NAMES.LAYOUT_ADJUSTED);
    });
}
