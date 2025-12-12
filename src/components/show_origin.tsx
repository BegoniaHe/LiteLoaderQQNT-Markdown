import { mditLogger } from "@/utils/logger";
import { useSettingsStore } from "@/states/settings";
import { DELAYS } from "@/config";
import { postProcessRenderedMessageBox } from "@/render/postprocess";
import { changeDirectionToColumnWhenLargerHeight } from "@/components/code_block";

// 存储消息框的原始和渲染后的内容
const messageContents = new WeakMap<HTMLElement, {
    original: string;
    rendered: string;
    isShowingOriginal: boolean;
}>();

/**
 * 创建"显示原文/渲染原文"右键菜单项
 * 使用 QQNT 的原生菜单项样式
 */
function createShowOriginalMenuItem(msgBox: HTMLElement): HTMLElement {
    const template = document.createElement("template");
    const content = messageContents.get(msgBox);
    const isShowingOriginal = content?.isShowingOriginal ?? false;
    
    template.innerHTML = `
        <a class="markdown-show-original q-context-menu-item q-context-menu-item--normal">
            <div class="q-context-menu-item__icon q-context-menu-item__head">
                <svg class="q-icon" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                    <path d="M8 1a7 7 0 100 14A7 7 0 008 1zM4 8h8" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                    <path d="M8 4v8" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                </svg>
            </div>
            <span class="q-context-menu-item__text">${isShowingOriginal ? '渲染原文' : '显示原文'}</span>
        </a>
    `;
    
    const menuItem = template.content.firstElementChild as HTMLElement;
    
    menuItem.addEventListener("click", function() {
        const content = messageContents.get(msgBox);
        if (!content) {
            mditLogger("error", "ShowOriginalContent", "Content not found in WeakMap");
            return;
        }
        
        try {
            if (content.isShowingOriginal) {
                // 切换到渲染后的内容
                msgBox.innerHTML = content.rendered;
                content.isShowingOriginal = false;
                mditLogger("debug", "Content switched to rendered");

                // 重新绑定渲染态需要的事件（innerHTML 会丢失事件监听）
                postProcessRenderedMessageBox(msgBox);
                changeDirectionToColumnWhenLargerHeight();
            } else {
                // 切换到原始内容
                msgBox.innerHTML = content.original;
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
    markdownBody: HTMLElement,
    msgBox: HTMLElement,
    originalInnerHTML: string
) {
    if (useSettingsStore.getState().showOriginalButton === false) {
        return;
    }

    // 保存原始和渲染后的内容
    messageContents.set(msgBox, {
        original: originalInnerHTML,
        rendered: msgBox.innerHTML,
        isShowingOriginal: false
    });

    // 监听右键菜单事件
    msgBox.addEventListener("contextmenu", function() {
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
