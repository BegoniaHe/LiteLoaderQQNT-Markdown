# 渲染流程详解

本文档描述本插件将 QQNT 消息渲染为 Markdown 的完整流程。

---

## 整体概览

```
MutationObserver 监听 DOM 变化
        ↓ (防抖触发)
    render()
        ↓ 找出未渲染的消息元素 (WeakSet 过滤)
    Promise.all(renderSingleMsgBox × N)
        ↓ 每条消息独立处理
    Fragment Processor 链（逐片段处理）
        ↓
    replaceChild（替换原始子节点）
        ↓
    postProcessRenderedMessageBox（后处理）
        ↓
    addShowOriginButtonToMarkdownBody（添加「显示原始内容」按钮）
        ↓
    changeDirectionToColumnWhenLargerHeight（全局后处理）
```

---

## 消息元素结构

QQNT 的消息框 DOM 结构大致如下：

```html
<span class="mix-message__inner">        <!-- msgBox -->
  <span class="text-element">...</span>  <!-- 文本片段 -->
  <span class="at-element">...</span>    <!-- @某人 -->
  <span class="face-element">...</span>  <!-- 表情 -->
</span>
```

本插件将 `msgBox`（`mix-message__inner`）的每个直接子节点（`span`）视为一个**片段（Fragment）**，分别交给 Fragment Processor 链处理。

---

## Fragment Processor 机制

每个片段会依次经过 `processorList` 中的所有处理器，处理器**按顺序、抢占式**匹配：

```typescript
type FragmentProcessFunc = (
    parent: HTMLElement,
    element: HTMLElement,
    index: number,
) => { original: HTMLElement; rendered: HTMLElement } | undefined;
```

- 若当前处理器返回非 `undefined` 值，则停止继续匹配，使用该返回结果。
- 若所有处理器均返回 `undefined`，则保持该片段原样不变。

返回值结构：
- `original`：原始 DOM 元素（用于后续 `replaceChild`）
- `rendered`：渲染后的 DOM 元素（替换到消息框中）

> 注意：某些处理器会直接修改 `original` 元素而非创建新元素，此时 `original === rendered`。

Fragment Processor 的完整实现见 `src/render/msgpiece_processor.tsx`。

---

## 并发安全与 WeakSet 双重标记

`renderSingleMsgBox()` 是异步函数。为防止同一消息被并发渲染两次，使用了**双重标记**策略：

```typescript
// 1. WeakSet 标记（内存级，可靠）
const renderedMessages = new WeakSet<HTMLElement>();

async function renderSingleMsgBox(messageBox: HTMLElement) {
    if (renderedMessages.has(messageBox)) return;
    renderedMessages.add(messageBox);  // 立即标记，防止并发

    // 2. CSS 类名标记（供样式使用）
    messageBox.classList.add(CLASS_NAMES.MARKDOWN_RENDERED);

    // ... 渲染逻辑
}
```

WeakSet 相比 CSS 类名标记更可靠，因为它不受 DOM 操作影响，不会因外部脚本修改类名而失效。

---

## 竞态问题修复（Promise.all）

`render()` 调用 `renderSingleMsgBox()` 时使用 `Promise.all` 等待所有消息渲染完成后，再执行全局后处理函数：

```typescript
async function render() {
    const renderPromises = newlyFoundMsgList.map(async (msgBox) => {
        await renderSingleMsgBox(msgBox as HTMLElement);
    });

    await Promise.all(renderPromises);

    // 后处理函数在所有消息渲染完成后执行
    changeDirectionToColumnWhenLargerHeight();
    elementDebugLogger();
}
```

这解决了历史版本中后处理函数可能在消息渲染完成前执行的竞态问题。

---

## 后处理阶段

每条消息渲染完成后，会依次执行：

1. **`postProcessRenderedMessageBox(markdownBody)`**（`src/render/postprocess.ts`）  
   - 为所有外部链接绑定 `openExternal` 事件
   - 对链接 URL 进行协议白名单校验（见[安全机制](./security.md)）

2. **`addShowOriginButtonToMarkdownBody(...)`**（`src/components/show_origin.tsx`）  
   - 在消息框中添加「显示原始内容」切换按钮
   - 原始节点在渲染前已通过 `cloneNode(true)` 深拷贝保存，避免字符串序列化引发注入边界问题

---

## 全局后处理

所有消息渲染完成后：

- **`changeDirectionToColumnWhenLargerHeight()`**（`src/components/code_block.tsx`）  
  检测代码块高度，当高度超出阈值时调整布局方向为纵向，改善大代码块的展示效果。

---

## 延伸阅读

- [项目架构](./architecture.md)
- [安全机制说明](./security.md)
