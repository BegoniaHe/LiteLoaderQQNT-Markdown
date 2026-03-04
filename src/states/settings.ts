import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { LiteLoaderStorage } from "@/utils/liteloader_config";
import { persist, subscribeWithSelector } from "zustand/middleware";

export interface SettingStateProperties {
    // Boolean properties
    linkify: boolean;
    typographer: boolean;
    codeHighlightThemeFollowSystem: boolean;

    // HTML related settings
    unescapeAllHtmlEntities: boolean;
    enableHtmlPurify: boolean;

    // HTML escape settings
    unescapeGtInText: boolean;
    unescapeBeforeHighlight: boolean;

    // Debug settings
    consoleOutput: boolean; // If false, mditLogger will not output to console.
    enableElementCapture: boolean;
    showOriginalButton: boolean;
}

export interface SettingStateAction {
    // Function properties
    forceUnescapeBeforeHighlight(): boolean | undefined;

    forceEnableHtmlPurify(): boolean | undefined;

    // Function to update a setting
    updateSetting(key: keyof SettingStateProperties, value: boolean): void;
}

/**
 * forcefieldName() method is used to return the value indicating the setting
 * `fieldName` is forced to that value despite the value stored in state.
 * Return `undefined` means repect values stored in states.
 * For example, when `unescapeAllHtmlEntities = true`, `forceEnableHtmlPurify()`
 * should return `true` to make sure all HTML content be sanitized before rendering.
 */
export const useSettingsStore = create<SettingStateProperties & SettingStateAction>()(
    persist(
        immer(
            subscribeWithSelector((set, get) => ({
                linkify: true,
                typographer: false,
                codeHighlightThemeFollowSystem: true,

                // HTML related
                unescapeAllHtmlEntities: false,
                enableHtmlPurify: false,

                // HTML escape settings
                unescapeGtInText: true,
                unescapeBeforeHighlight: true,

                // Debug settings
                consoleOutput: true,
                enableElementCapture: false,
                showOriginalButton: false,

                forceUnescapeBeforeHighlight: () => {
                    if (get().unescapeAllHtmlEntities === true) {
                        return false;
                    }
                    return undefined;
                },

                forceEnableHtmlPurify: () => {
                    if (get().unescapeAllHtmlEntities === true) {
                        return true;
                    }
                    return undefined;
                },

                updateSetting: (key, value) => {
                    // 类型和有效性检查
                    if (!(key in get())) {
                        console.error(`[Settings] Invalid setting key: ${key}`);
                        return;
                    }
                    if (typeof value !== "boolean") {
                        console.error(
                            `[Settings] Invalid value type for ${key}: expected boolean, got ${typeof value}`
                        );
                        return;
                    }

                    set((state) => {
                        state[key] = value;

                        // 安全策略：HTML净化和反转义的双向约束
                        // 防止XSS攻击风险
                        if (key === "unescapeAllHtmlEntities" && value === true) {
                            // 启用完全反转义时，强制启用HTML净化
                            state.enableHtmlPurify = true;
                        } else if (key === "enableHtmlPurify" && value === false) {
                            // 禁用HTML净化时，强制禁用完全反转义
                            state.unescapeAllHtmlEntities = false;
                        }
                    });
                },
            }))
        ),
        {
            name: "settings",
            storage: LiteLoaderStorage,
        }
    )
);
