/**
 * Markdown-it 插件类型声明
 * 
 * 由于部分插件没有官方 @types 包，我们在此手动声明类型
 */

declare module 'markdown-it-footnote' {
    import MarkdownIt from 'markdown-it';
    const plugin: MarkdownIt.PluginSimple;
    export default plugin;
}

declare module 'markdown-it-mark' {
    import MarkdownIt from 'markdown-it';
    const plugin: MarkdownIt.PluginSimple;
    export default plugin;
}

declare module 'markdown-it-sub' {
    import MarkdownIt from 'markdown-it';
    const plugin: MarkdownIt.PluginSimple;
    export default plugin;
}

declare module 'markdown-it-sup' {
    import MarkdownIt from 'markdown-it';
    const plugin: MarkdownIt.PluginSimple;
    export default plugin;
}

declare module 'markdown-it-emoji' {
    import MarkdownIt from 'markdown-it';
    export const bare: MarkdownIt.PluginSimple;
    export const light: MarkdownIt.PluginSimple;
    export const full: MarkdownIt.PluginSimple;
}

declare module 'markdown-it-deflist' {
    import MarkdownIt from 'markdown-it';
    const plugin: MarkdownIt.PluginSimple;
    export default plugin;
}

declare module 'markdown-it-ins' {
    import MarkdownIt from 'markdown-it';
    const plugin: MarkdownIt.PluginSimple;
    export default plugin;
}

declare module 'markdown-it-abbr' {
    import MarkdownIt from 'markdown-it';
    const plugin: MarkdownIt.PluginSimple;
    export default plugin;
}
