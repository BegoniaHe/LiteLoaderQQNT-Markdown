// Electron 主进程 与 渲染进程 交互的桥梁
import { contextBridge, ipcRenderer } from "electron";
import { IPC_CHANNELS } from "@/common/constants";

/**
 * 通过 contextBridge 安全地暴露 IPC 接口到渲染进程
 *
 * 安全性说明：
 * - 使用 contextBridge 而非直接暴露 ipcRenderer，符合 Electron 安全最佳实践
 * - 只暴露必要的接口，限制渲染进程的权限范围
 * - 防止渲染进程直接访问 Node.js API
 *
 * LiteLoaderQQNT 集成说明：
 * - 遵循 LLNT IPC 命名规范: LiteLoader.{plugin_slug}.{method}
 * - 与主进程通过 ipcMain.handle 注册的通道对应
 */
contextBridge.exposeInMainWorld("markdown_it", {
    log: (consoleType: string, ...args: unknown[]) =>
        ipcRenderer.invoke(IPC_CHANNELS.LOG, consoleType, ...args),
    get_log_path: () => ipcRenderer.invoke(IPC_CHANNELS.GET_LOG_PATH),
});
