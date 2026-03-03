# 安装本插件

在开始之前，请确保您已经按照 [LiteLoaderQQNT 官方安装教程](https://liteloaderqqnt.github.io/guide/install.html) 成功安装并正常运行 LiteLoaderQQNT。

安装方式：

- 通过「插件列表查看」安装（推荐）
- 通过下载 Release 压缩包安装
- 通过 `git clone` 克隆项目（仅开发者）

## 通过「插件列表查看」安装（推荐）

「插件列表查看」本身是一个 LiteLoaderQQNT 插件。首先根据其官方文档的指引，安装 [插件列表查看](https://github.com/ltxhhz/LL-plugin-list-viewer/tree/main) 插件。

安装完成后重启QQ，进入设置 > 插件列表查看，找到 `Markdown-it` 插件，点击安装。显示安装成功后，再次重启QQ即可。

![Plugin View Plug](https://github.com/user-attachments/assets/60b36c62-1899-4a88-b4c1-5cd4bb296968)


## 通过 Release 压缩包安装

进入本项目 [Releases](https://github.com/BegoniaHe/LiteLoaderQQNT-Markdown/releases) 页面，在最新的 Release 中下载 `Release.zip` 文件。

下载完成后，进入 LiteLoader 插件页，打开数据目录。

创建名为 `markdown-it` 的文件夹，将下载好的 `Release.zip` 解压到新建文件夹中即可。

> 注意：解压时不要启用解压软件的「解压到新文件夹中」选项。

## 克隆项目（仅开发者）

首先克隆本项目：

```bash
git clone https://github.com/BegoniaHe/LiteLoaderQQNT-Markdown.git
cd LiteLoaderQQNT-Markdown
```

安装依赖并构建：

```bash
npm ci          # 安装依赖（使用锁定版本）
npm run build   # 生产构建
```

构建完成后，项目文件夹即为有效的插件目录。如需生成与 Release 相同的压缩包：

```bash
npm run release
```

开发模式（webpack 监听，实时构建）：

```bash
npm run dev
```





