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

    /** 检查日志目录权限通道 */
    CHECK_LOG_PERMISSION: "LiteLoader.markdown_it.check_log_permission",
} as const;

