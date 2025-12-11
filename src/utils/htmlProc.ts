// Utils function about HTML string process

import { mditLogger } from "./logger";
import DOMPurify from 'dompurify';

interface UponSanitizeDataRecv {
    tagName: string;
    allowedTags: Record<string, boolean>;
}

/**
 * DOMPurify Hook: 将不允许的HTML标签转换为纯文本显示
 * 
 * 安全说明：
 * - 此Hook在DOMPurify净化过程中执行，将不在白名单中的标签转为<p>元素
 * - 使用textContent确保标签名以纯文本形式显示，防止任何潜在的HTML注入
 * - 这是防御深度策略的一部分：即使有标签绕过了初始净化，也会被转为纯文本
 */
DOMPurify.addHook('uponSanitizeElement', function (node: HTMLElement, data: UponSanitizeDataRecv) {
    if (data.allowedTags[data.tagName] === true) {
        return;
    }
    const newNode = document.createElement('p');
    // 使用textContent而非outerHTML，仅保留标签名信息作为纯文本
    newNode.textContent = `<${data.tagName}>`;
    node.replaceWith(newNode);
});

/**
 * Unescape HTML entities in HTML string. Already unescaped HTML tag string will be ignored and not shown 
 * in return string.
 * @param {string} input 
 * @returns {string} String with all HTML entities unescaped
 */
export function unescapeHtml(input: string) {
    var doc = new DOMParser().parseFromString(input, "text/html");
    return doc.documentElement.textContent;
}

export function escapeHtml(input: string) {
    return input
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

/**
 * Using DOMPurify to purify HTML
 * @param {string} input 
 * @return {string} Purified HTML string.
 */
export function purifyHtml(input: string) {
    let res = DOMPurify.sanitize(input);
    mditLogger('debug', 'Purify', 'Removed', DOMPurify.removed);
    return res;
}