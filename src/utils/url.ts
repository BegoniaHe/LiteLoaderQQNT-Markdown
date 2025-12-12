/**
 * URL sanitize helpers.
 *
 * 在 QQNT/LiteLoader 环境下，链接内容可能来自消息文本渲染结果。
 * 这里做“打开外链”前的最后一道校验，避免意外 scheme 或畸形 URL。
 */

const DEFAULT_ALLOWED_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

export interface SanitizeExternalUrlOptions {
    allowedProtocols?: ReadonlySet<string>;
}

/**
 * 将 href 规范化为可用于 openExternal 的字符串；不安全则返回 undefined。
 */
export function sanitizeExternalUrl(
    href: string,
    options: SanitizeExternalUrlOptions = {}
): string | undefined {
    const trimmed = String(href ?? "").trim();
    if (!trimmed) {
        return undefined;
    }

    // 忽略纯 hash / 相对锚点
    if (trimmed.startsWith("#")) {
        return undefined;
    }

    // 统一清理 QQNT 可能注入的 renderer 前缀
    const cleaned = trimmed.replace(/^app:\/\/\.\/renderer\//, "");

    // 拒绝明显的相对路径（避免被 base 误解析成外链）
    if (
        cleaned.startsWith("/") ||
        cleaned.startsWith("./") ||
        cleaned.startsWith("../") ||
        cleaned.startsWith("?")
    ) {
        return undefined;
    }

    // 允许协议相对 URL（//example.com），默认按 https 处理
    if (cleaned.startsWith("//")) {
        try {
            const parsed = new URL(`https:${cleaned}`);
            return parsed.toString();
        } catch {
            return undefined;
        }
    }

    // 允许裸域名/主机（example.com / www.example.com / localhost / 127.0.0.1 / [::1]）
    // 规则：不含空白，且匹配域名/localhost/ip/ipv6-host 的基本形态；默认补全 https://
    const looksLikeHost =
        /^\[.*\](?::\d+)?(?:\/.*)?$/.test(cleaned) || // [::1] 或 [ipv6]:port
        /^(?:localhost|\d{1,3}(?:\.\d{1,3}){3})(?::\d+)?(?:\/.*)?$/i.test(cleaned) || // localhost / ipv4
        /^(?:[a-z0-9-]+\.)+[a-z0-9-]+(?::\d+)?(?:\/.*)?$/i.test(cleaned); // domain

    if (looksLikeHost && !/\s/.test(cleaned) && !/^[a-z][a-z0-9+.-]*:/i.test(cleaned)) {
        try {
            const parsed = new URL(`https://${cleaned}`);
            return parsed.toString();
        } catch {
            return undefined;
        }
    }

    const allowedProtocols = options.allowedProtocols ?? DEFAULT_ALLOWED_PROTOCOLS;

    // 只接受带 scheme 的绝对 URL（此处不再用 base 解析，避免相对路径误入）
    let parsed: URL;
    try {
        parsed = new URL(cleaned);
    } catch {
        return undefined;
    }

    if (!allowedProtocols.has(parsed.protocol)) {
        return undefined;
    }

    // mailto/tel 保留原始输入（避免 toString 产生非预期规范化）
    if (parsed.protocol === "mailto:" || parsed.protocol === "tel:") {
        return cleaned;
    }

    return parsed.toString();
}
