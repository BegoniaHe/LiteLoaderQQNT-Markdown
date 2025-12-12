import React from "react";
import type { SettingStateProperties } from "@/states/settings";
import { useSettingsStore } from "@/states/settings";
import { mditLogger } from "@/utils/logger";

/**
 * LiteLoaderQQNT 设置页面组件
 * 使用 LLNT 提供的 Web Components
 */
export function SettingPage() {
    const settings = useSettingsStore((states) => states);

    return (
        <>
            <setting-section data-title="关于">
                <setting-panel>
                    <setting-list data-direction="column">
                        <ButtonTile
                            title="Github 仓库"
                            caption="本项目的 Github 源代码仓库地址。"
                            actionName="查看源代码"
                            href="https://github.com/d0j1a1701/LiteLoaderQQNT-Markdown"
                        />
                        <ButtonTile
                            title="提交反馈"
                            caption="提交您对于本插件的建议，或者反馈使用中遇到的问题。"
                            actionName="提交反馈"
                            href="https://github.com/d0j1a1701/LiteLoaderQQNT-Markdown/issues/new"
                        />
                    </setting-list>
                </setting-panel>

                <setting-panel>
                    <setting-list data-direction="column">
                        <DescriptionTile
                            title="设置更新"
                            caption="在此页面更新设置后，大部分设置会即时生效。如需完全重置请重启QQ。"
                        />
                    </setting-list>
                </setting-panel>
            </setting-section>

            <setting-section data-title="基础设置">
                <setting-panel>
                    <setting-list data-direction="column">
                        <DescriptionTile
                            title="启用/停用 Markdown_it"
                            caption='请通过 "LiteLoaderQQNT -> 扩展" 管理页面启用或停用本插件'
                        />

                        <SwitchSettingTile
                            settingName="linkify"
                            title="Linkify"
                            caption="将可能是链接的内容自动格式化为链接格式"
                        />

                        <SwitchSettingTile
                            settingName="typographer"
                            title="Typographer"
                            caption='语言书写相关以及引号的优化，如："你好" -> "你好"'
                        />

                        <SwitchSettingTile
                            settingName="codeHighligtThemeFollowSystem"
                            title="代码高亮主题自适应"
                            caption="启用此选项后，浅色模式和深色模式下将自动套用对应的代码高亮背景"
                        />
                    </setting-list>
                </setting-panel>
            </setting-section>

            <setting-section data-title="HTML渲染">
                <setting-panel>
                    <setting-list data-direction="column">
                        <SwitchSettingTile
                            settingName="unescapeAllHtmlEntites"
                            title="HTML渲染"
                            caption='反转义并渲染消息中的HTML标签。本选项与"HTML净化"互相关联，两者必须同时启用或禁用以确保安全。'
                        />

                        <SwitchSettingTile
                            settingName="enableHtmlPurify"
                            title="HTML净化"
                            caption='过滤不安全的HTML标签。本选项与"HTML渲染"互相关联，以防止XSS攻击。'
                        />
                    </setting-list>
                </setting-panel>
            </setting-section>

            <setting-section data-title="开发者调试（请慎重修改此部分设置）">
                <setting-panel>
                    <setting-list data-direction="column">
                        <DescriptionTile
                            title="SettingsState"
                            caption={JSON.stringify(settings, undefined, " ")}
                        />
                    </setting-list>
                </setting-panel>

                <setting-panel>
                    <setting-list data-direction="column">
                        <SwitchSettingTile
                            settingName="showOriginalButton"
                            title="显示原信息按钮"
                            caption="开启后，点击消息后的 Show Original 按钮即可查看渲染前的消息内容"
                        />
                    </setting-list>
                </setting-panel>

                <setting-panel>
                    <setting-list data-direction="column">
                        <SwitchSettingTile
                            settingName="consoleOutput"
                            title="控制台输出"
                            caption="关闭后，将屏蔽 MarkdownIt 插件向控制台输出的信息，目前仅能屏蔽部分信息。"
                        />

                        <SwitchSettingTile
                            settingName="enableElementCapture"
                            title="启用元素调试"
                            caption="开启后，将在控制台输出指定调试消息的HTML片段。"
                        />
                    </setting-list>
                </setting-panel>

                <setting-panel>
                    <setting-list data-direction="column">
                        <SwitchSettingTile
                            settingName="unescapeGtInText"
                            title='反转义消息字符中的">"符号'
                            caption="开启后，可正常显示 Blockquote 格式。"
                        />

                        <SwitchSettingTile
                            settingName="unescapeBeforeHighlight"
                            title="反转义代码块内容"
                            caption="开启后，在Highlight.js高亮处理之前，先对代码块内容进行反转义，可保证代码块内 HTML Entites 的正常显示。开启HTML渲染功能后，所有消息内的 HTML Entities 都会被反转义，故此选项自动关闭。"
                        />
                    </setting-list>
                </setting-panel>
            </setting-section>
        </>
    );
}

/**
 * 开关设置项组件属性
 */
interface SwitchSettingTileProps {
    settingName: keyof SettingStateProperties;
    title?: string;
    caption?: string;
}

/**
 * 开关设置项组件
 */
function SwitchSettingTile({ settingName, title, caption }: SwitchSettingTileProps) {
    const settings = useSettingsStore((states) => states);
    const updateSetting = useSettingsStore((states) => states.updateSetting);

    // 获取强制值（如果存在）
    const getForceValue = (() => {
        const forceSettingName =
            "force" + settingName.charAt(0).toUpperCase() + settingName.slice(1);
        return () => {
            try {
                const forceMethod = (settings as unknown as Record<string, unknown>)[
                    forceSettingName
                ];
                return typeof forceMethod === "function"
                    ? (forceMethod as () => boolean | undefined)()
                    : undefined;
            } catch (e) {
                return undefined;
            }
        };
    })();

    const forceValue = getForceValue();
    const settingsValue = forceValue ?? settings[settingName];
    
    const isDisabled = forceValue !== undefined;

    return (
        <setting-item>
            <TextAndCaptionBlock title={title ?? settingName} caption={caption ?? ""} />
            <setting-switch
                data-direction="row"
                onClick={() => {
                    if (!isDisabled) {
                        updateSetting(settingName, !settings[settingName]);
                    }
                }}
                is-active={settingsValue === true ? true : undefined}
                is-disabled={isDisabled ? true : undefined}
                style={{ flex: "none" }}
            />
        </setting-item>
    );
}

/**
 * 描述文本项组件属性
 */
interface DescriptionTileProps {
    title: string;
    caption: string;
}

/**
 * 描述文本项组件
 */
function DescriptionTile({ title, caption }: DescriptionTileProps) {
    return (
        <setting-item data-direction="row">
            <TextAndCaptionBlock title={title} caption={caption} />
        </setting-item>
    );
}

/**
 * 文本和说明块组件属性
 */
interface TextAndCaptionBlockProps {
    title: string;
    caption: string;
}

/**
 * 文本和说明块组件
 */
function TextAndCaptionBlock({ title, caption }: TextAndCaptionBlockProps) {
    return (
        <div
            style={{
                display: "flex",
                flexWrap: "wrap",
                flexDirection: "column",
                flex: "1 1 auto",
            }}
        >
            <setting-text>{title}</setting-text>
            <setting-text
                data-type="secondary"
                style={{
                    marginTop: "3px",
                    wordBreak: "break-word",
                }}
            >
                <p style={{ overflowY: "scroll" }}>{caption}</p>
            </setting-text>
        </div>
    );
}

/**
 * 按钮项组件属性
 */
interface ButtonTileProps {
    title: string;
    caption: string;
    href?: string;
    path?: string;
    callback?: () => void | Promise<void>;
    actionName: string;
}

/**
 * 按钮项组件
 */
function ButtonTile({ title, caption, href, path, callback, actionName }: ButtonTileProps) {
    const defaultCallback = () => {
        if (href) {
            LiteLoader.api.openExternal(href);
            return;
        }
        if (path) {
            LiteLoader.api.openPath(path);
            return;
        }
        mditLogger("debug", "Button with no action clicked");
    };

    return (
        <setting-item data-direction="row">
            <TextAndCaptionBlock title={title} caption={caption} />
            <setting-button
                data-type="secondary"
                onClick={callback ?? defaultCallback}
                style={{ flex: "none" }}
            >
                {actionName}
            </setting-button>
        </setting-item>
    );
}

/**
 * LiteLoaderQQNT Web Components 类型声明
 */
declare global {
    namespace JSX {
        interface IntrinsicElements {
            "setting-section": React.DetailedHTMLProps<
                React.HTMLAttributes<HTMLElement> & { "data-title"?: string },
                HTMLElement
            >;
            "setting-panel": React.DetailedHTMLProps<
                React.HTMLAttributes<HTMLElement>,
                HTMLElement
            >;
            "setting-list": React.DetailedHTMLProps<
                React.HTMLAttributes<HTMLElement> & { "data-direction"?: string },
                HTMLElement
            >;
            "setting-item": React.DetailedHTMLProps<
                React.HTMLAttributes<HTMLElement> & { "data-direction"?: string },
                HTMLElement
            >;
            "setting-text": React.DetailedHTMLProps<
                React.HTMLAttributes<HTMLElement> & { "data-type"?: string },
                HTMLElement
            >;
            "setting-switch": React.DetailedHTMLProps<
                React.HTMLAttributes<HTMLElement> & {
                    "data-direction"?: string;
                    "is-active"?: boolean | undefined;
                    "is-disabled"?: boolean | undefined;
                },
                HTMLElement
            >;
            "setting-button": React.DetailedHTMLProps<
                React.HTMLAttributes<HTMLElement> & { "data-type"?: string },
                HTMLElement
            >;
        }
    }
}
