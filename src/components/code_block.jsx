import React from "react";
import hljs from 'highlight.js';

import { unescapeHtml, escapeHtml } from '@/utils/htmlProc';
import { useSettingsStore } from '@/states/settings';
import { mditLogger } from "@/utils/logger";
import { CLASS_NAMES, SELECTORS, PERFORMANCE } from '@/config';

export function HighLightedCodeBlock({ content, lang, markdownItIns }) {

    if (!lang || !hljs.getLanguage(lang)) {
        lang = 'plaintext';
    }

    function contentPreprocess(input) {

        // if unescapeAll has enabled, unescape code content again may cause display error
        // so here we should force skip unescape process and ignore user settings.
        if (useSettingsStore.getState().forceUnescapeBeforeHighlight() === false) {
            return input;
        }

        if (useSettingsStore.getState().unescapeBeforeHighlight === true) {
            return unescapeHtml(input);
        }

        return input;
    }

    var Finalcontent = "";
    try {
        Finalcontent = hljs.highlight(contentPreprocess(content), { language: lang, ignoreIllegals: true }).value;
    } catch (e) {
        mditLogger('error', `hljs error:`, e);
    }

    return (<pre className={`hljs ${CLASS_NAMES.HL_CODE_BLOCK} ${CLASS_NAMES.MDIT_FENCED_CODE_BLOCK}`}>
        <button className='lang_copy'>
            <p className='lang'>{lang}</p>
            <p className='copy'>复制</p>
        </button>
        <code dangerouslySetInnerHTML={{ __html: Finalcontent }}></code>
    </pre>);
}

export function renderInlineCodeBlockString(tokens, idx, options, env, slf) {
    var token = tokens[idx];

    if (useSettingsStore.getState().unescapeAllHtmlEntites === true) {
        token.content = escapeHtml(token.content);
    }


    return '<code' + slf.renderAttrs(token) + '>' +
        token.content +
        '</code>';
}

/**
 * Find all Copy Button and add click handler to it. Will directly mutate the received 
 * HTML element.
 * 
 * @param {HTMLElement} element 
 */
export function addOnClickHandleForCopyButton(element) {
    var buttons = element.querySelectorAll(SELECTORS.CODE_COPY_BUTTON);
    Array.from(buttons)
        .forEach(function (copyButton) {
            try {
                // get content of this code block
                var codeContent = copyButton.parentElement.querySelector('code').textContent;
                copyButton.onclick = () => { navigator.clipboard.writeText(codeContent) };
            } catch (e) {
                mditLogger('error', 'Failed to add click handler for copy button:', e);
            }
        });
}

/**
 * Find all Copy Button of Latex block and add hanlder to it.
 * 
 * @param {HTMLElement} element 
 */
export function addOnClickHandleForLatexBlock(element) {
    var buttons = element.querySelectorAll(SELECTORS.LATEX_COPY_BUTTON);

    Array.from(buttons)
        .forEach(function (copyButton) {
            try {
                // find tex annotation
                var latexAnno = copyButton.parentElement.querySelector(SELECTORS.LATEX_ANNOTATION).textContent;
                copyButton.onclick = () => { navigator.clipboard.writeText(latexAnno) };
            } catch (e) {
                mditLogger('error', 'Failed to add click handler for LaTeX copy button:', e);
            }
        });
}

export function changeDirectionToColumnWhenLargerHeight() {
    var msgBlocks = document.querySelectorAll(SELECTORS.MIX_MESSAGE_INNER);
    Array.from(msgBlocks).forEach(function (block) {
        var height = block.offsetHeight;
        mditLogger('debug', 'Detected messagebox height:', height);
        // 当消息高度超过阈值时，改为列布局
        if (height > PERFORMANCE.MESSAGE_HEIGHT_THRESHOLD) {
            block.style.flexDirection = 'column';
        }
        else {
            block.style.flexDirection = 'row';
        }
    });
}