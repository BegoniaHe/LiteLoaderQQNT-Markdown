import katex from "@traptitech/markdown-it-katex";
import MarkdownIt from "markdown-it";
import React from "react";

import markdownItAbbr from "markdown-it-abbr";
import markdownItDeflist from "markdown-it-deflist";
import { full as markdownItEmojiPlugin } from "markdown-it-emoji";
import markdownItFootnote from "markdown-it-footnote";
import markdownItInsert from "markdown-it-ins";
import markdownItMark from "markdown-it-mark";
import markdownItSub from "markdown-it-sub";
import markdownItSup from "markdown-it-sup";
import markdownItTaskLists from "markdown-it-task-lists";
import { renderToString } from "react-dom/server";

import { HighLightedCodeBlock, renderInlineCodeBlockString } from "@/components/code_block";
import { MARKDOWN_CONFIG } from "@/config";
import { mditLogger } from "@/utils/logger";

import type { PipelineSettingsSnapshot } from "../types";

let markdownItIns: MarkdownIt | undefined = undefined;
let markdownEngineCacheKey = "";

function buildMarkdownEngineCacheKey(settings: PipelineSettingsSnapshot): string {
    return `${settings.linkify}|${settings.typographer}|${settings.unescapeAllHtmlEntities}`;
}

function createMarkdownEngine(settings: PipelineSettingsSnapshot): MarkdownIt {
    mditLogger("info", "Generating new markdown-it renderer...");

    const localMarkdownItIns = new MarkdownIt({
        // 仅在显式启用“HTML渲染”时才允许 markdown-it 解析原始 HTML
        // 否则按纯文本处理，避免不必要的攻击面
        html: settings.unescapeAllHtmlEntities === true,
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
        highlight: function (str: string, lang: string): string {
            return renderToString(
                React.createElement(HighLightedCodeBlock, {
                    content: str,
                    lang,
                    markdownItIns: localMarkdownItIns,
                })
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
    return localMarkdownItIns;
}

function getMarkdownEngine(settings: PipelineSettingsSnapshot): MarkdownIt {
    const nextCacheKey = buildMarkdownEngineCacheKey(settings);

    if (markdownItIns !== undefined && markdownEngineCacheKey === nextCacheKey) {
        return markdownItIns;
    }

    markdownItIns = createMarkdownEngine(settings);
    markdownEngineCacheKey = nextCacheKey;
    return markdownItIns;
}

export function renderMarkdown(markdownSource: string, settings: PipelineSettingsSnapshot): string {
    return getMarkdownEngine(settings).render(markdownSource);
}
