// Electron 主进程 与 渲染进程 交互的桥梁
const { contextBridge, ipcRenderer } = require("electron");

/**
 * 通过 contextBridge 安全地暴露 IPC 接口到渲染进程
 * 
 * 安全性说明：
 * - 使用 contextBridge 而非直接暴露 ipcRenderer，符合 Electron 安全最佳实践
 * - 只暴露必要的接口，限制渲染进程的权限范围
 * - 防止渲染进程直接访问 Node.js API
 */
contextBridge.exposeInMainWorld("markdown_it", {
    log: (consoleType, ...args) => 
        ipcRenderer.invoke('LiteLoader.markdown_it.log', consoleType, ...args),
    get_log_path: () => 
        ipcRenderer.invoke('LiteLoader.markdown_it.get_log_path'),
});
