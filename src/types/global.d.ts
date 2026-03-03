/**
 * 全局类型声明文件
 * 统一声明 LiteLoaderQQNT 提供的全局对象和类型
 */

import type React from "react";

/**
 * LiteLoaderQQNT 插件接口定义
 * 基于 LiteLoaderQQNT 1.4.1 源码
 */
interface LiteLoaderAPI {
    path: {
        root: string; // LiteLoader 根目录
        profile: string; // 配置文件目录
        data: string; // 数据目录
        plugins: string; // 插件目录
    };

    versions: {
        qqnt: string; // QQNT 版本
        liteloader: string; // LiteLoader 版本
        electron: string; // Electron 版本
        node: string; // Node.js 版本
        chrome: string; // Chrome 版本
    };

    os: {
        platform: string; // 操作系统平台
    };

    package: {
        liteloader: Record<string, unknown>; // LiteLoader package.json
        qqnt: Record<string, unknown>; // QQNT package.json
    };

    plugins: {
        [slug: string]: {
            manifest: Record<string, unknown>; // 插件清单
            incompatible: boolean; // 是否不兼容
            disabled: boolean; // 是否被禁用
            path: {
                plugin: string; // 插件根目录
                data: string; // 插件数据目录
                injects: {
                    main: string | null; // 主进程脚本路径
                    renderer: string | null; // 渲染进程脚本路径
                    preload: string | null; // 预加载脚本路径
                };
            };
        };
    };

    api: {
        openExternal(url: string): void;
        openPath(path: string): void;
        config: {
            set(slug: string, config: Record<string, unknown>): Promise<Record<string, unknown>>;
            get(
                slug: string,
                defaultConfig: Record<string, unknown>
            ): Promise<Record<string, unknown>>;
        };
        plugin: {
            install(slug: string): void;
            delete(slug: string, options: boolean[]): void;
            disable(slug: string, disabled: boolean): void;
        };
    };
}

/**
 * 全局对象声明
 */
declare global {
    const LiteLoader: LiteLoaderAPI;
}

type SettingElementProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;

declare module "react" {
    namespace JSX {
        interface IntrinsicElements {
            "setting-section": SettingElementProps;
            "setting-panel": SettingElementProps;
            "setting-list": SettingElementProps;
            "setting-item": SettingElementProps;
            "setting-switch": SettingElementProps;
            "setting-text": SettingElementProps;
            "setting-button": SettingElementProps;
        }
    }
}

export {};
