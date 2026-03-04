import { PLUGIN_CONFIG } from "@/config";
import { resolvePluginDataPath } from "@/utils/plugin_identity";
import { createWriteStream, existsSync, mkdirSync, unlinkSync, writeFileSync } from "fs";
import * as path from "path";

export const LogPathHelper = {
    getLogFolderPath() {
        const dataPath = resolvePluginDataPath();
        if (dataPath) {
            return path.join(dataPath, PLUGIN_CONFIG.LOG_FOLDER);
        }

        return path.join(LiteLoader.path.data, PLUGIN_CONFIG.SLUG, PLUGIN_CONFIG.LOG_FOLDER);
    },

    /**
     * 检测是否有日志目录的写入权限
     * @returns true 表示有权限，false 表示无权限
     */
    checkLogPermission(): boolean {
        try {
            const logFolderPath = this.getLogFolderPath();

            // 尝试创建日志目录
            if (!existsSync(logFolderPath)) {
                mkdirSync(logFolderPath, { recursive: true });
            }

            // 尝试写入测试文件
            const testFilePath = path.join(logFolderPath, ".permission_test");
            writeFileSync(testFilePath, "test");

            // 清理测试文件
            unlinkSync(testFilePath);

            return true;
        } catch (error) {
            console.warn("[markdown-it] 无日志目录写入权限:", error);
            return false;
        }
    },

    /**
     * Get absolute file path of a log file.
     *
     * @param logFileName Name of the log file. If `undefined`,
     * will generate automatically based on current time.
     */
    getLogFilePath(logFileName?: string | undefined) {
        // generate log file name if not received
        logFileName ??= new Date().toISOString().replaceAll(":", "-");

        return path.join(LogPathHelper.getLogFolderPath(), `${logFileName}.log`);
    },
};

/**
 * Generate a writer function that used to write log into log file.
 */
export function generateMainProcessLogerWriter() {
    const logFolderPath = LogPathHelper.getLogFolderPath();
    const logFilePath = LogPathHelper.getLogFilePath();

    // create dir if not exists
    try {
        if (!existsSync(logFolderPath)) {
            mkdirSync(logFolderPath, { recursive: true });
        }
    } catch (err) {
        console.error("[markdown-it] Failed to create log directory:", err);
        // 返回一个空函数，避免后续调用出错
        return () => Promise.resolve();
    }

    const stream = createWriteStream(logFilePath, {
        flags: "a+",
    });

    return async function (consoleMode: string, ...args: unknown[]) {
        const timeStr = new Date().toISOString();

        const argsStr = args.reduce(function (str: string, value: unknown) {
            if (typeof value === "string") {
                return str + value + " ";
            }
            try {
                return str + JSON.stringify(value) + " ";
            } catch {
                // 处理循环引用等无法序列化的情况
                return str + String(value) + " ";
            }
        }, "");

        const logStr = `${consoleMode.toUpperCase()} | ${timeStr} | ${argsStr}`;
        stream.write(`${logStr}\n`);
    };
}
