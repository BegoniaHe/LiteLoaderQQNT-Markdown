/**
 * Contains util functions about logger.
 */

import { useSettingsStore } from "@/states/settings";

type DistributiveFilter<Origin, Filter> = Origin extends Filter ? Origin : never;

/**
 * All functions member type of `console`.
 */
type LoggerFuncKey = {
    [K in keyof Console]: Console[K] extends (...args: unknown[]) => unknown ? K : never;
}[keyof Console];

/**
 * String literal unions of the supported logger function type.
 *
 * `DistributiveFilter` will filtered out all options that actually not a valid function of console.
 */
export type SupportedLoggerFuncKey = DistributiveFilter<
    LoggerFuncKey,
    "debug" | "log" | "info" | "warn" | "error"
>;

function outputToConsoleSettingEnabled(): boolean {
    return useSettingsStore.getState().consoleOutput;
}

export interface MditLoggerOptions {
    /**
     * Determine if a log will be output in DevTools console
     */
    consoleOutput: boolean;
}

const defaultMditLoggerOptions: MditLoggerOptions = {
    consoleOutput: true,
};

/**
 * Logger function generator. Could generate log functions based on some configurations to
 * fit different use cases.
 * @param options `MditLoggerOptions`
 */
export function mditLoggerGenerator(
    options: MditLoggerOptions = defaultMditLoggerOptions
): (consoleFunction: SupportedLoggerFuncKey, ...params: unknown[]) => undefined {
    return function (consoleFunction: SupportedLoggerFuncKey, ...params: unknown[]) {
        // if user enabled console output in settings, and the console output config of this logger is on
        if (outputToConsoleSettingEnabled() && options.consoleOutput) {
            console[consoleFunction](
                "%c [MarkdownIt] ",
                "background-color: rgba(0, 149, 204, 0.8); border-radius: 6px;padding-block: 2px; padding-inline: 0px; color: white;",
                ...params
            );
        }

        return undefined;
    };
}

/**
 * Markdown it console output wrapper.
 *
 * @param consoleFunction The name of the member function you want to use in `console`. For exmaple: `'debug'` or `'info'`
 * @param params Params that passed to `console` function.
 *
 * @example
 *
 * ```js
 * mditLogger('debug', 'This is a debug message', {name: 'Jobs', age: 17});
 * ```
 */
export const mditLogger = mditLoggerGenerator();

const loggedClassName = "--mdit-debug-capture-element-logged";
const logFlagClassName = "--mdit-debug-capture-element";

export function elementDebugLogger() {
    const enabled = useSettingsStore.getState().enableElementCapture;
    if (!enabled) {
        return;
    }
    mditLogger("info", "ElementCapture triggered");
    const codeEle = document.querySelectorAll(
        "div.message-content__wrapper div.container--self code"
    );

    // Add flag class for all marked --mdit-debug-capture-element
    Array.from(codeEle)
        .filter((ele) => ele.innerHTML == logFlagClassName)
        .forEach((ele) => {
            ele.classList.add(logFlagClassName);
        });

    // find all self sent message box that has been marked to capture, then log it.
    const flaggedMsgBoxs = document.querySelectorAll(
        `div.message-content__wrapper div.container--self:has(.${logFlagClassName})`
    );

    let loggedCount = 0;
    Array.from(flaggedMsgBoxs)
        .filter((ele) => !ele.classList.contains(loggedClassName)) // ensure one message box will only be logged one time
        .forEach((ele) => {
            // 文件日志已禁用，仅输出到控制台
            mditLogger("debug", `Element captured: ${ele.tagName}`, ele.outerHTML.substring(0, 500));

            ele.classList.add(loggedClassName);
            loggedCount++;
        });

    mditLogger("info", "Element Capture Finished:", `${loggedCount} element(s) has been logged`);
}
