// 运行在 Electron 主进程 下的插件入口

function onBrowserWindowCreated() {
    try {
        onLoad();
    } catch (e) {
        console.error("[markdown-it]", e);
    }
}

// 加载插件时触发
function onLoad() {
    // 插件初始化逻辑（如果需要）
}

// 这两个函数都是可选的
export { onBrowserWindowCreated };
