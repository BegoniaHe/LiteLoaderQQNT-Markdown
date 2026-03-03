import { mditLogger } from "@/utils/logger";
import { useSettingsStore } from "@/states/settings";
import { DELAYS } from "@/config";
import { postProcessRenderedMessageBox } from "@/render/postprocess";
import { changeDirectionToColumnWhenLargerHeight } from "@/components/code_block";

type StoredMessageContent = {
    originalNodes: Node[];
    renderedNodes: Node[];
    isShowingOriginal: boolean;
};

function cloneNodes(nodes: readonly Node[]): Node[] {
    return nodes.map((node) => node.cloneNode(true));
}

function applyNodes(target: HTMLElement, nodes: readonly Node[]): void {
    target.replaceChildren(...cloneNodes(nodes));
}

// 存储消息框的原始和渲染后的内容（使用 Node 克隆，避免 innerHTML 注入与重复解析）
const messageContents = new WeakMap<HTMLElement, StoredMessageContent>();

/**
 * 创建"显示原文/渲染原文"右键菜单项
 * 使用 QQNT 的原生菜单项样式
 */
function createShowOriginalMenuItem(msgBox: HTMLElement): HTMLElement {
    const content = messageContents.get(msgBox);
    const isShowingOriginal = content?.isShowingOriginal ?? false;

    const menuItem = document.createElement("a");
    menuItem.className = "markdown-show-original q-context-menu-item q-context-menu-item--normal";

    const iconWrap = document.createElement("div");
    iconWrap.className = "q-context-menu-item__icon q-context-menu-item__head";

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("class", "q-icon");
    svg.setAttribute("viewBox", "0 0 16 16");
    svg.setAttribute("xmlns", svgNS);
    svg.setAttribute("width", "16");
    svg.setAttribute("height", "16");

    const path1 = document.createElementNS(svgNS, "path");
    path1.setAttribute("d", "M8 1a7 7 0 100 14A7 7 0 008 1zM4 8h8");
    path1.setAttribute("stroke", "currentColor");
    path1.setAttribute("stroke-width", "1.5");
    path1.setAttribute("fill", "none");
    path1.setAttribute("stroke-linecap", "round");

    const path2 = document.createElementNS(svgNS, "path");
    path2.setAttribute("d", "M8 4v8");
    path2.setAttribute("stroke", "currentColor");
    path2.setAttribute("stroke-width", "1.5");
    path2.setAttribute("fill", "none");
    path2.setAttribute("stroke-linecap", "round");

    svg.appendChild(path1);
    svg.appendChild(path2);
    iconWrap.appendChild(svg);

    const text = document.createElement("span");
    text.className = "q-context-menu-item__text";
    text.textContent = isShowingOriginal ? "渲染原文" : "显示原文";

    menuItem.appendChild(iconWrap);
    menuItem.appendChild(text);

    menuItem.addEventListener("click", function () {
        const content = messageContents.get(msgBox);
        if (!content) {
            mditLogger("error", "ShowOriginalContent", "Content not found in WeakMap");
            return;
        }

        try {
            if (content.isShowingOriginal) {
                // 切换到渲染后的内容
                applyNodes(msgBox, content.renderedNodes);
                content.isShowingOriginal = false;
                mditLogger("debug", "Content switched to rendered");

                // 重新绑定渲染态需要的事件（innerHTML 会丢失事件监听）
                postProcessRenderedMessageBox(msgBox);
                changeDirectionToColumnWhenLargerHeight();
            } else {
                // 切换到原始内容
                applyNodes(msgBox, content.originalNodes);
                content.isShowingOriginal = true;
                mditLogger("debug", "Content switched to original");
            }
        } catch (e) {
            mditLogger("error", "ShowOriginalContent - Failed to toggle content:", e);
        }
    });

    return menuItem;
}

/**
 * 为 Markdown 渲染的消息框添加右键菜单"显示原文/渲染原文"功能
 * 通过监听消息框的 contextmenu 事件来注入菜单项
 *
 * @param markdownBody - Markdown 渲染后的内容元素
 * @param msgBox - 消息框元素
 * @param originalInnerHTML - 原始 HTML 内容
 */
export function addShowOriginButtonToMarkdownBody(
    _markdownBody: HTMLElement,
    msgBox: HTMLElement,
    originalNodes: Node[]
) {
    if (useSettingsStore.getState().showOriginalButton === false) {
        return;
    }

    // 保存原始和渲染后的内容（均使用 Node 克隆）
    messageContents.set(msgBox, {
        originalNodes: cloneNodes(originalNodes),
        renderedNodes: cloneNodes(Array.from(msgBox.childNodes)),
        isShowingOriginal: false,
    });

    // 监听右键菜单事件
    msgBox.addEventListener("contextmenu", function () {
        // 延迟执行，确保 QQNT 的右键菜单已经创建
        setTimeout(() => {
            const contextMenu = document.querySelector(".q-context-menu");
            if (contextMenu) {
                // 移除旧的菜单项（如果存在）
                const oldMenuItem = contextMenu.querySelector(".markdown-show-original");
                if (oldMenuItem) {
                    oldMenuItem.remove();
                }

                // 创建新的菜单项（根据当前状态显示不同文本）
                const menuItem = createShowOriginalMenuItem(msgBox);
                contextMenu.appendChild(menuItem);
                mditLogger("debug", "Show Original menu item added to context menu");
            }
        }, DELAYS.CONTEXT_MENU_INJECT);
    });

    mditLogger("debug", "Show Original context menu listener attached");
}
