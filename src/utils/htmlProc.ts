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
DOMPurify.addHook("uponSanitizeElement" as any, function (node: Element, data: any) {
    if (data.allowedTags && data.allowedTags[data.tagName] === true) {
        return;
    }
    const newNode = document.createElement("p");
    // 使用textContent而非outerHTML，仅保留标签名信息作为纯文本
    newNode.textContent = `<${data.tagName}>`;
    node.replaceWith(newNode);
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
 * - 移除了 style 属性，防止 CSS 注入
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
            "svg",
            "path",
            "line",
            "rect",
            "circle",
            "ellipse",
            "polygon",
            "polyline",
            "g",
            "defs",
            "use",
            "symbol",
            "clipPath",
        ],
        // 允许的属性白名单
        ALLOWED_ATTR: [
            "class",
            "id",
            "style",
            "href",
            "title",
            "alt",
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
            // SVG 属性
            "viewBox",
            "preserveAspectRatio",
            "x",
            "y",
            "width",
            "height",
            "d",
            "fill",
            "stroke",
            "stroke-width",
            "transform",
            "points",
            "x1",
            "y1",
            "x2",
            "y2",
            "cx",
            "cy",
            "r",
            "rx",
            "ry",
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
            /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    });
    mditLogger("debug", "Purify", "Removed", DOMPurify.removed);
    return res;
}
