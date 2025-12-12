// 运行在 Electron 渲染进程 下的页面脚本
import { createRoot } from "react-dom/client";
import React from "react";
import { SettingPage } from "./components/setting_page";

// Components
import {
    addOnClickHandleForCopyButton,
    addOnClickHandleForLatexBlock,
    changeDirectionToColumnWhenLargerHeight,
} from "./components/code_block";
import { addShowOriginButtonToMarkdownBody } from "@/components/show_origin";

// States
import { useSettingsStore } from "@/states/settings";

// Utils
import { debounce } from "throttle-debounce";
import { mditLogger, elementDebugLogger } from "./utils/logger";
import { processorList } from "@/render/msgpiece_processor";

// Config
import { SELECTORS, CLASS_NAMES, DATA_ATTRIBUTES, PERFORMANCE, CSS_IDS } from "@/config";

/**
 * 使用 WeakSet 标记已渲染的消息元素
 */
const renderedMessages = new WeakSet<HTMLElement>();

onLoad();

/**
 * 使用防抖优化渲染性能
 * 防止短时间内频繁触发渲染函数
 */
const debouncedRender = debounce(PERFORMANCE.DEBOUNCE_DELAY, render, { atBegin: false });

/**
 * Root markdown render function.
 *
 * This function will get called once change of msgList is detected and a possible rerender is required.
 * 
 * 修复说明：
 * - 使用 Promise.all() 等待所有消息渲染完成
 * - 解决了后处理函数在渲染完成前执行的竞态条件问题
 */
async function render(): Promise<void> {
    mditLogger("debug", "renderer() triggered");

    const elements = document.querySelectorAll(SELECTORS.MESSAGE_CONTENT);

    const newlyFoundMsgList = Array.from(elements)
        // 跳过已渲染的消息 - 使用 WeakSet 更可靠
        .filter((messageBox) => !renderedMessages.has(messageBox as HTMLElement))
        // 跳过空消息
        .filter((messageBox) => messageBox.childNodes.length > 0);

    mditLogger("debug", "Newly found message count:", newlyFoundMsgList.length);

    // 等待所有消息渲染完成
    const renderPromises = newlyFoundMsgList.map(async (msgBox) => {
        try {
            await renderSingleMsgBox(msgBox as HTMLElement);
        } catch (e) {
            mditLogger("error", "Render msgbox failed", e);
        }
    });

    await Promise.all(renderPromises);

    // 后处理函数现在会在所有消息渲染完成后执行
    changeDirectionToColumnWhenLargerHeight();
    elementDebugLogger();
}

/**
 * Markdown body process function used in render() to add openExternal()
 * behavior to all links inside rendered markdownBody.
 * 
 * 确保所有链接（包括HTML渲染的<a>标签）都用系统浏览器打开
 */
function handleExternalLink(markdownBody: HTMLElement) {
    markdownBody.querySelectorAll("a").forEach((linkElement) => {
        // 添加样式类
        linkElement.classList.add("markdown_it_link");
        linkElement.classList.add("text-link");
        
        // 绑定点击事件，使用系统浏览器打开所有链接
        linkElement.onclick = async (event) => {
            event.preventDefault();
            event.stopPropagation();
            
            // 获取 href 属性
            const href = linkElement.getAttribute("href");
            if (href) {
                // 处理相对路径和 app:// 协议
                const cleanHref = href.replace("app://./renderer/", "");
                try {
                    await LiteLoader.api.openExternal(cleanHref);
                } catch (error) {
                    mditLogger("error", "Failed to open external link:", cleanHref, error);
                }
            }
            return false;
        };
    });
}

async function renderSingleMsgBox(messageBox: HTMLElement) {
    // 检查是否已渲染 - 双重检查确保安全
    if (renderedMessages.has(messageBox)) {
        return;
    }

    // 标记为已渲染 - 优先标记防止并发问题
    renderedMessages.add(messageBox);
    // 同时添加 CSS 类名作为后备标记（供样式使用）
    messageBox.classList.add(CLASS_NAMES.MARKDOWN_RENDERED);

    // original innerHTML for message box.
    // This is captured and used by "Show Original" feature.
    const msgBoxOriginalInnerHTML = messageBox.innerHTML;

    // Get all children of message box. Return if length is zero.
    const originalSpanList = Array.from(messageBox.children);
    mditLogger("debug", "renderSingleMsgBox", "originalSpanList:", originalSpanList);
    if (originalSpanList.length == 0) return;

    // Here using entityProcess which may finally call DOMParser().parseFromString(input, "text/html");
    // This may introduce XSS attack vulnerability, however, we will use DOMPurify to prevent all
    // dangerous HTML elements when rendering markdown.

    // use fragment processors to deal with the span in messages one by one
    // finally, we will get a list of rendered span
    const renderedSpanInfo = originalSpanList.map((msgSpan, index) => {
        mditLogger("debug", "PieceProcessor", "Original Piece:", msgSpan);

        // Try to apply piece processor in order. Stop once a processor could process current msgPiece
        for (const processor of processorList) {
            // try get the return value of the processor
            const renderedSpan = processor(messageBox, msgSpan as HTMLElement, index);
            // if processor returned a non-undefined value, use the new element
            if (renderedSpan !== undefined) {
                return renderedSpan;
            }
        }

        // here means no any frag processor could handle this msgSpan, just return itself,
        // in other word, keep it's original looks.
        return { original: msgSpan, rendered: msgSpan };
    });

    mditLogger("debug", "RenderedList generated, start replacing messagebox children...");

    // replace the children based on rendered info
    for (const renderedInfo of renderedSpanInfo) {
        mditLogger("debug", "Try to replace:", renderedInfo);
        messageBox.replaceChild(renderedInfo.rendered, renderedInfo.original);
    }

    const markdownBody = messageBox;

    // Handle click of Copy Code Button
    addOnClickHandleForCopyButton(markdownBody);

    // Handle click of Copy Latex Button
    addOnClickHandleForLatexBlock(markdownBody);

    // Handle open external link
    handleExternalLink(markdownBody);

    // Add ShowOriginalContent button for this message.
    addShowOriginButtonToMarkdownBody(markdownBody, messageBox, msgBoxOriginalInnerHTML);
}

function _onLoad() {
    const plugin_path = LiteLoader.plugins.markdown_it.path.plugin;

    loadCSSFromURL(`local:///${plugin_path}/src/style/markdown.css`);
    loadCSSFromURL(`local:///${plugin_path}/src/style/katex.css`);
    loadCSSFromURL(
        `local:///${plugin_path}/src/style/hljs-github-dark.css`,
        CSS_IDS.GITHUB_HL_DARK
    );
    loadCSSFromURL(`local:///${plugin_path}/src/style/hljs-github.css`, CSS_IDS.GITHUB_HL_ADAPTIVE);

    // Change fenced code block theme based on settings.
    useSettingsStore.subscribe(
        (state: { codeHighligtThemeFollowSystem: boolean }) => state.codeHighligtThemeFollowSystem,
        (isFollowSystem: boolean) => {
            if (isFollowSystem) {
                loadCSSFromURL(
                    `local:///${plugin_path}/src/style/hljs-github.css`,
                    CSS_IDS.GITHUB_HL_ADAPTIVE
                );
            } else {
                loadCSSFromURL(
                    `local:///${plugin_path}/src/style/hljs-github-dark.css`,
                    CSS_IDS.GITHUB_HL_DARK
                );
            }
        }
    );

    // Observe the change of message list. Once changed, trigger render() function.
    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === "childList") {
                // avoid error in render break users QQNT.
                try {
                    debouncedRender();
                } catch (e) {
                    mditLogger("error", "Render error in MutationObserver:", e);
                }
            }
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * Util function used in onLoad() to load local CSS.
 */
function loadCSSFromURL(url: string, id?: string) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;
    if (id) {
        link.id = id;
    }
    document.head.appendChild(link);
}

function onLoad() {
    try {
        mditLogger("debug", "[MarkdownIt] OnLoad() triggered");
        return _onLoad();
    } catch (e) {
        mditLogger("error", e);
    }
}

// 打开设置界面时触发
function onSettingWindowCreated(view: HTMLElement) {
    const root = createRoot(view);
    root.render(<SettingPage></SettingPage>);
}

export { onSettingWindowCreated, onLoad };
