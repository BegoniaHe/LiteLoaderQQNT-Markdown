// Utils function about HTML string process

import { mditLogger } from "./logger";
import DOMPurify from "dompurify";
import he from "he";

/**
 * DOMPurify Hook: 将不允许的HTML标签转换为纯文本显示
 *
 * 安全说明：
 * - 此Hook在DOMPurify净化过程中执行，将不在白名单中的标签转为<p>元素
 * - 使用textContent确保标签名以纯文本形式显示，防止任何潜在的HTML注入
 * - 这是防御深度策略的一部分：即使有标签绕过了初始净化，也会被转为纯文本
 */
DOMPurify.addHook("uponSanitizeElement", function (
    currentNode: Node,
    hookEvent: { tagName: string; allowedTags: Record<string, boolean> }
) {
    if (!(currentNode instanceof Element)) {
        return;
    }

    if (hookEvent.allowedTags && hookEvent.allowedTags[hookEvent.tagName] === true) {
        return;
    }

    const newNode = document.createElement("p");
    newNode.textContent = `<${hookEvent.tagName}>`;
    currentNode.replaceWith(newNode);
});

/**
 * DOMPurify Hook: 过滤高风险属性值
 *
 * 这里采用“保留 style，但移除高危片段”的折中策略。
 */
DOMPurify.addHook("uponSanitizeAttribute", function (
    _currentNode: Element,
    hookEvent: { attrName: string; attrValue: string; keepAttr: boolean }
) {
    if (hookEvent.attrName !== "style") {
        return;
    }

    const styleValue = String(hookEvent.attrValue ?? "").toLowerCase();

    // 粗粒度拦截高危 CSS 片段（防止通过 url()/@import/expression 等方式做注入或资源加载）
    // 注意：这里不做完整 CSS 解析，仅做保守过滤。
    const isDangerous =
        styleValue.includes("expression(") ||
        styleValue.includes("url(") ||
        styleValue.includes("@import") ||
        styleValue.includes("javascript:") ||
        styleValue.includes("vbscript:") ||
        styleValue.includes("data:") ||
        styleValue.includes("behavior:") ||
        styleValue.includes("-moz-binding");

    if (isDangerous) {
        hookEvent.keepAttr = false;
    }
});

/**
 * Unescape HTML entities in HTML string using he.js library.
 *
 * 安全说明：
 * - 使用 he.js 库进行 HTML 实体解码，避免 DOMParser 可能的安全风险
 * - he.js 是纯文本处理，不会执行任何 HTML/JavaScript
 * - 解码后的内容仍需经过 DOMPurify 净化才能安全渲染
 *
 * @param {string} input - 包含 HTML 实体的字符串
 * @returns {string} 解码后的字符串
 */
export function unescapeHtml(input: string): string {
    return he.decode(input);
}

export function escapeHtml(input: string) {
    return input
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

/**
 * 使用 DOMPurify 净化 HTML
 * 
 * 安全配置：
 * - 保留 style 属性（业务需要），但通过 Hook 过滤高危 CSS 片段
 * - 限制 data-* 属性为特定前缀
 * - 严格的标签和属性白名单
 * 
 * @param {string} input - 待净化的HTML字符串
 * @return {string} 净化后的HTML字符串
 */
export function purifyHtml(input: string): string {
    const res = DOMPurify.sanitize(input, {
        // 允许的标签白名单 - 扩展以支持更多 Markdown 功能
        ALLOWED_TAGS: [
            // 基础标签
            "p",
            "br",
            "span",
            "div",
            "a",
            "code",
            "pre",
            // 图片
            "img",
            // 格式化标签
            "strong",
            "em",
            "u",
            "s",
            "b",
            "i",
            "mark",
            "ins",
            "del",
            "sub",
            "sup",
            "small",
            "kbd",
            "abbr",
            "button",
            // 列表
            "ul",
            "ol",
            "li",
            "dl",
            "dt",
            "dd",
            // 标题
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6",
            // 引用和分隔
            "blockquote",
            "hr",
            // 表格
            "table",
            "thead",
            "tbody",
            "tfoot",
            "tr",
            "th",
            "td",
            "caption",
            // 交互元素
            "details",
            "summary",
            "input",
            // 结构化标签
            "section",
            // KaTeX/MathML 数学公式标签
            "math",
            "semantics",
            "mrow",
            "mi",
            "mo",
            "mn",
            "msup",
            "msub",
            "mfrac",
            "munder",
            "mover",
            "munderover",
            "msqrt",
            "mroot",
            "mtext",
            "menclose",
            "mtable",
            "mtr",
            "mtd",
            "annotation",
            "mspace",
            "mpadded",
            "mstyle",
            "merror",
            "mphantom",
        ],
        // 允许的属性白名单
        ALLOWED_ATTR: [
            "class",
            "id",
            "style",
            "href",
            "title",
            "alt",
            // img
            "src",
            "srcset",
            "loading",
            "decoding",
            "referrerpolicy",
            "width",
            "height",
            // markdown-it 脚注专用属性
            "data-footnote-id",
            "data-footnote-backref",
            // MathML 属性
            "xmlns",
            "encoding",
            "displaystyle",
            "mathvariant",
            "scriptlevel",
            "accent",
            "accentunder",
            "align",
            "bevelled",
            "close",
            "columnalign",
            "columnlines",
            "columnspacing",
            "depth",
            "display",
            "displaystyle",
            "fence",
            "frame",
            "height",
            "linethickness",
            "lspace",
            "mathbackground",
            "mathcolor",
            "mathsize",
            "mathvariant",
            "maxsize",
            "minsize",
            "movablelimits",
            "notation",
            "numalign",
            "open",
            "rowalign",
            "rowlines",
            "rowspacing",
            "rspace",
            "scriptlevel",
            "separator",
            "separators",
            "stretchy",
            "width",
            // 可访问性属性
            "aria-label",
            "aria-hidden",
            // 交互元素属性
            "open",
            "target",
            "rel",
            // 表格属性
            "colspan",
            "rowspan",
            // 表单属性
            "type",
            "checked",
            "disabled",
        ],
        // 禁用通配 data 属性，仅允许明确列出的
        ALLOW_DATA_ATTR: false,
        // 保持安全的 URI 协议
        ALLOWED_URI_REGEXP:
            /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
    });
    mditLogger("debug", "Purify", "Removed", DOMPurify.removed);
    return res;
}
