import {
    addOnClickHandleForCopyButton,
    addOnClickHandleForLatexBlock,
} from "@/components/code_block";
import { mditLogger } from "@/utils/logger";
import { sanitizeExternalUrl } from "@/utils/url";

/**
 * 对“已渲染成 HTML 的消息框”执行后处理（事件绑定等）。
 *
 * 注意：此函数应是幂等的（重复执行不会产生叠加副作用）。
 */
export function postProcessRenderedMessageBox(messageBox: HTMLElement): void {
    // Handle click of Copy Code Button
    addOnClickHandleForCopyButton(messageBox);

    // Handle click of Copy Latex Button
    addOnClickHandleForLatexBlock(messageBox);

    // Ensure all links open externally
    messageBox.querySelectorAll("a").forEach((linkElement) => {
        linkElement.classList.add("markdown_it_link");
        linkElement.classList.add("text-link");

        linkElement.onclick = async (event) => {
            event.preventDefault();
            event.stopPropagation();

            const href = linkElement.getAttribute("href");
            if (href) {
                const cleanHref = sanitizeExternalUrl(href);
                if (!cleanHref) {
                    mditLogger("warn", "Blocked unsafe external link:", href);
                    return false;
                }
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
