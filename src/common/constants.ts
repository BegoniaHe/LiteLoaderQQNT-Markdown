/**
 * 共享常量文件
 * 供 TypeScript 和 JavaScript (preload) 共同使用
 */

/**
 * IPC 通道名称常量
 * 遵循 LiteLoaderQQNT 命名规范: LiteLoader.{plugin_slug}.{method}
 */
export const IPC_CHANNELS = {
    /** 日志记录通道 */
    LOG: "LiteLoader.markdown_it.log",

    /** 获取日志路径通道 */
    GET_LOG_PATH: "LiteLoader.markdown_it.get_log_path",
} as const;

/**
 * 插件配置常量
 */
export const PLUGIN_CONFIG = {
    /** 插件 slug 前缀（用于配置存储） */
    SLUG_PREFIX: "markdown_it",

    /** 日志文件夹名称 */
    LOG_FOLDER: "log",
} as const;
