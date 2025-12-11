// 运行在 Electron 主进程 下的插件入口
import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { generateMainProcessLogerWriter, LogPathHelper } from '@/utils/logger_main';

const loggerWriter = generateMainProcessLogerWriter();

function onBrowserWindowCreated() {
    try {
        onLoad();
    } catch (e) {
        console.error('[markdown-it]', e);
    }
}

// 加载插件时触发
function onLoad() {
    ipcMain.handle('LiteLoader.markdown_it.log', (_event: IpcMainInvokeEvent, consoleMode: string, ...args: any[]) => {
        loggerWriter(consoleMode, ...args);
    });
    ipcMain.handle('LiteLoader.markdown_it.get_log_path', (_event: IpcMainInvokeEvent) => LogPathHelper.getLogFolderPath());
}

// 这两个函数都是可选的
export {
    onBrowserWindowCreated,
};
