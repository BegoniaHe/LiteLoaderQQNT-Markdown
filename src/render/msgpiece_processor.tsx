// markdown
import React from "react";
import markdownIt from "markdown-it";
import { renderToString } from "react-dom/server";
import hljs from "highlight.js";
import katex from "@/lib/markdown-it-katex";

// markdown-it 高级功能插件
import markdownItFootnote from "markdown-it-footnote";
import markdownItMark from "markdown-it-mark";
import markdownItSub from "markdown-it-sub";
import markdownItSup from "markdown-it-sup";
import { full as markdownItEmojiPlugin } from "markdown-it-emoji";
import markdownItDeflist from "markdown-it-deflist";
import markdownItInsert from "markdown-it-ins";
import markdownItAbbr from "markdown-it-abbr";
import markdownItTaskLists from "markdown-it-task-lists";

// Components
import { HighLightedCodeBlock, renderInlineCodeBlockString } from "@/components/code_block";

// Settings
import { useSettingsStore } from "@/states/settings";

// Utils
import { escapeHtml, purifyHtml, unescapeHtml } from "@/utils/htmlProc";
import { mditLogger } from "@/utils/logger";

// Config
import { SELECTORS, CLASS_NAMES, MARKDOWN_CONFIG } from "@/config";

type ReplaceFunc = (parentElement: HTMLElement, id: string) => any;

/**
 * Data type used by renderer to determine how to render and replace an element.
 */
export interface MsgProcessInfo {
    mark: string;
    replace?: ReplaceFunc;
    id?: string;
}
let markdownItIns: markdownIt | undefined = undefined;

/**
 * 重置 Markdown-it 实例，用于配置更新时重新初始化
 */
function resetMarkdownIns() {
    markdownItIns = undefined;
    mditLogger("info", "Markdown-it instance reset, will regenerate on next render");
}

/**
 * 初始化配置监听器，当相关设置变更时重置 Markdown-it 实例
 */
function initializeSettingsWatcher() {
    // 监听 linkify 和 typographer 设置的变化
    type MarkdownSettings = { linkify: boolean; typographer: boolean };
    useSettingsStore.subscribe(
        (state: { linkify: boolean; typographer: boolean }) => ({
            linkify: state.linkify,
            typographer: state.typographer,
        }),
        (newSettings: MarkdownSettings, prevSettings: MarkdownSettings) => {
            if (
                newSettings.linkify !== prevSettings.linkify ||
                newSettings.typographer !== prevSettings.typographer
            ) {
                mditLogger("info", "Markdown-it settings changed, resetting instance");
                resetMarkdownIns();
            }
        },
        {
            equalityFn: (a: MarkdownSettings, b: MarkdownSettings) =>
                a.linkify === b.linkify && a.typographer === b.typographer,
        }
    );
}

// 在模块加载时初始化监听器
initializeSettingsWatcher();

/**
 * Function that generates a MarkdownIt instance based on user settings.
 */
function getMarkdownIns() {
    const settings = useSettingsStore.getState();
    if (markdownItIns !== undefined) {
        return markdownItIns;
    }
    mditLogger("info", "Generating new markdown-it renderer...");
    const localMarkdownItIns = markdownIt({
        html: true, // 在源码中启用 HTML 标签
        xhtmlOut: true, // 使用 '/' 来闭合单标签 （比如 <br />）。
        // 这个选项只对完全的 CommonMark 模式兼容。
        breaks: true, // 转换段落里的 '\n' 到 <br>。
        langPrefix: MARKDOWN_CONFIG.LANG_PREFIX, // 给围栏代码块的 CSS 语言前缀。对于额外的高亮代码非常有用。
        linkify: settings.linkify, // 将类似 URL 的文本自动转换为链接。

        // 启用一些语言中立的替换 + 引号美化
        typographer: settings.typographer,

        // 双 + 单引号替换对，当 typographer 启用时。
        quotes: MARKDOWN_CONFIG.QUOTES,

        // custom highlight UI renderer for markdown it.
        highlight: function (str: string, lang: string) {
            return renderToString(
                <HighLightedCodeBlock
                    content={str}
                    lang={lang}
                    markdownItIns={localMarkdownItIns}
                />
            );
        },
    })
        // 数学公式支持
        .use(katex)
        // 脚注支持 [^1]
        .use(markdownItFootnote)
        // 高亮文本 ==marked==
        .use(markdownItMark)
        // 下标 H~2~O
        .use(markdownItSub)
        // 上标 X^2^
        .use(markdownItSup)
        // 表情符号 :smile:
        .use(markdownItEmojiPlugin)
        // 定义列表
        .use(markdownItDeflist)
        // 插入文本 ++inserted++
        .use(markdownItInsert)
        // 缩写定义
        .use(markdownItAbbr)
        // 任务列表 [ ] [x]
        .use(markdownItTaskLists, { enabled: true });

    localMarkdownItIns.renderer.rules.code_inline = renderInlineCodeBlockString;
    markdownItIns = localMarkdownItIns;
    return localMarkdownItIns;
}

/**
 * Function type that used to process children elements inside QQNT message box.
 */
type FragmentProcessFunc = (
    parent: HTMLElement,
    element: HTMLElement,
    index: number
) => FragmentProcessFuncRetType | undefined;

interface FragmentProcessFuncRetType {
    original: HTMLElement;
    rendered: HTMLElement;
}

/**
 * Message fragment processor that deal with all text span in messages.
 * @param element
 * @returns
 */
const textElementProcessor: FragmentProcessFunc = (parent, element, index) => {
    // text processor
    const settings = useSettingsStore.getState();

    // generate rendered HTML processor based on user config.
    function renderedHtmlPostProcessor(x: string): string {
        // text processor
        if ((settings.forceEnableHtmlPurify() ?? settings.enableHtmlPurify) === true) {
            mditLogger("debug", `Purify`, "Input:", `${x}`);
            return purifyHtml(x) as string;
        }

        return x;
    }

    // filter to only process pure text messages fragments
    if (
        !(element.tagName == "SPAN") ||
        !element.classList.contains(SELECTORS.TEXT_ELEMENT) ||
        element.querySelector(SELECTORS.AT_ELEMENT)
    ) {
        return undefined;
    }

    mditLogger("debug", "ElementMatch", "Source", element);
    mditLogger("debug", "Element", "Match", "spanTextProcessor");

    /**
     * HTML实体处理器
     * 
     * 安全策略（修复后）：
     * - 移除了手动正则替换逻辑，避免绕过风险
     * - 完全依赖 he.decode() 进行实体解码
     * - 依赖 DOMPurify 作为最终安全防线
     * 
     * @param x - 输入的HTML字符串
     * @returns 处理后的字符串
     */
    function entityProcesor(x: string): string {
        // 如果启用了完全反转义，使用 he.decode() 解码所有HTML实体
        if (settings.unescapeAllHtmlEntites === true) {
            return unescapeHtml(x);
        }

        // 仅处理引用符号的反转义（用于Blockquote支持）
        let result = x;
        if (settings.unescapeGtInText === true) {
            result = result.replaceAll("&gt;", ">");
        }

        return result;
    }

    // get all text in this text span
    const originalText = Array.from(element.getElementsByTagName("span"))
        .map((element) => element.innerHTML)
        .reduce((acc, x) => acc + entityProcesor(x), "");

    // render
    const renderedTextElement = element;
    let renderedMarkdownInnerHtml =
        // first use markdownit to render the html text
        // then passed to post processor (post processor also accept text)
        renderedHtmlPostProcessor(getMarkdownIns().render(originalText)).trim();
    mditLogger("debug", "Rendered/post-processed HTML innterText:", renderedMarkdownInnerHtml);

    // remove unnecessary wrapping <p> if there is only one element
    const renderedHtmlElement = new DOMParser().parseFromString(
        renderedMarkdownInnerHtml,
        "text/html"
    );
    mditLogger(
        "debug",
        "renderedHtmlElement.body.children.length==1",
        renderedHtmlElement.body.children.length == 1
    );
    mditLogger(
        "debug",
        "renderedMarkdownInnerHtml.startsWith(p)",
        renderedMarkdownInnerHtml.startsWith("<p>")
    );
    mditLogger(
        "debug",
        "renderedMarkdownInnerHtml.endsWith(p)",
        renderedMarkdownInnerHtml.endsWith("</p>")
    );
    if (
        renderedHtmlElement.body.children.length == 1 &&
        renderedMarkdownInnerHtml.startsWith("<p>") &&
        renderedMarkdownInnerHtml.endsWith("</p>")
    ) {
        renderedMarkdownInnerHtml = renderedMarkdownInnerHtml
            .substring(3, renderedMarkdownInnerHtml.length - 4)
            .trim();
        mditLogger("debug", "Striped innerHTML:", renderedMarkdownInnerHtml);
    }

    renderedTextElement.innerHTML = renderedMarkdownInnerHtml;

    return {
        original: element,
        rendered: renderedTextElement,
    };
};

/**
 * Triggered from begin to end, preemptive.
 */
export const processorList: FragmentProcessFunc[] = [textElementProcessor];
