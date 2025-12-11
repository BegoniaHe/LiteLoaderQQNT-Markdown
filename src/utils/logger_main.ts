import * as path from "path";
import { existsSync, mkdirSync, rmSync, createWriteStream } from "fs";
import { PLUGIN_CONFIG } from "@/config";

export const LogPathHelper = {
    getLogFolderPath() {
        return path.join(LiteLoader.plugins.markdown_it.path.data, PLUGIN_CONFIG.LOG_FOLDER);
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

    console.log(`[markdown-it] logFolderPath: ${logFolderPath}`);
    console.log(`[markdown-it] logFilePath: ${logFilePath}`);

    // clear former log file
    try {
        rmSync(logFolderPath, { recursive: true });
    } catch (e) {
        console.error("[markdown-it] Failed to remove previous log file:", e);
    }

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
            } catch (e) {
                // 处理循环引用等无法序列化的情况
                return str + String(value) + " ";
            }
        }, "");

        const logStr = `${consoleMode.toUpperCase()} | ${timeStr} | ${argsStr}`;
        stream.write(`${logStr}\n`);
    };
}
