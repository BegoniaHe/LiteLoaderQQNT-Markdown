# LiteLoaderQQNT-Markdown

[![GitHub Release](https://img.shields.io/github/v/release/BegoniaHe/LiteLoaderQQNT-Markdown?style=for-the-badge&logo=github)](https://github.com/BegoniaHe/LiteLoaderQQNT-Markdown/releases)
[![GitHub License](https://img.shields.io/github/license/BegoniaHe/LiteLoaderQQNT-Markdown?style=for-the-badge&color=blue)](https://github.com/BegoniaHe/LiteLoaderQQNT-Markdown/blob/main/LICENSE)
[![GitHub last commit](https://img.shields.io/github/last-commit/BegoniaHe/LiteLoaderQQNT-Markdown?style=for-the-badge&logo=github)](https://github.com/BegoniaHe/LiteLoaderQQNT-Markdown/commits/main/)
[![GitHub Issues or Pull Requests](https://img.shields.io/github/issues/BegoniaHe/LiteLoaderQQNT-Markdown?style=for-the-badge&color=rgb(50%2C180%2C50))](https://github.com/BegoniaHe/LiteLoaderQQNT-Markdown/issues)


## 简介

本项目是 [Ikaleio/LiteLoaderQQNT-Markdown](https://github.com/Ikaleio/LiteLoaderQQNT-Markdown) 的 Fork 与改进版本，在此衷心感谢原项目作者及所有贡献者的辛勤工作。

这是一个 [LiteLoaderQQNT](https://github.com/mo-jinran/LiteLoaderQQNT) 插件，使用 [markdown-it](https://github.com/markdown-it/markdown-it) 为 QQNT 增加 Markdown、$\LaTeX$ 以及 HTML 渲染功能。

## 安装

请跟随[安装引导](./docs/plug_install.md)完成插件安装。

## 功能

### 标准 Markdown 语法渲染

![image](https://github.com/d0j1a1701/LiteLoaderQQNT-Markdown/assets/61616918/41b9fa09-c888-4b06-822b-7384d3b05df6)

<details><summary>对应消息原文</summary>

```markdown
## Normal

Normal test

Normal test with HTML Entities & " ' < > .

## List 

- List Item
- List Item

1. Ordered List
2. Ordered List

## Blockquote

> Test
>
>> Nested Test
```

</details>

### 代码块渲染与语法高亮

![image](https://github.com/d0j1a1701/LiteLoaderQQNT-Markdown/assets/61616918/22acdfa7-a033-4269-839c-04ca829f0a5a)

<details><summary>对应消息原文</summary>

    ```javascript
    // Declare a function
    function myFunction() {
    document.getElementById("demo").innerHTML = "Hello World!";
    }

    // Call the function
    myFunction();
    ```

</details>

### $\LaTeX$ 公式渲染（基于 [KaTeX](https://katex.org/)）

![image](https://github.com/d0j1a1701/LiteLoaderQQNT-Markdown/assets/61616918/343a74b7-1c35-46a6-af15-e5ad7eb82376)

<details><summary>对应消息原文</summary>

    Inline LaTeX Here: $e^{i\pi} + 1 = 0$!

    LaTeX Block also available!

    $$
    \displaystyle \left( \sum_{k=1}^n a_k b_k \right)^2 \leq \left( \sum_{k=1}^n a_k^2 \right) \left( \sum_{k=1}^n b_k^2 \right)
    $$

</details>

### 支持第三方主题

![image](https://github.com/d0j1a1701/LiteLoaderQQNT-Markdown/assets/48874489/be3b2aff-e69d-4655-aab6-912632b9d51c)

图中主题为 [MUKAPP/LiteLoaderQQNT-MSpring-Theme](https://github.com/MUKAPP/LiteLoaderQQNT-MSpring-Theme)。

<details><summary>对应消息原文</summary>

    # Markdown test
    `inline code test`
    **加粗**~~删除~~__下划线__
    [这是个链接](https://example.com)
    $\LaTeX \color{red}{red text}$
    ```cpp
    #include <iostream>
    using namespace std;
    int main(){
        cout << "Meow" << endl;
        return 0;
    }
    ```
    > This is a quote test.

</details>

## 使用问题

- 遇到渲染异常或功能疑问，请先查阅 [常见问题（FAQ）](./docs/faq.md)。
- 确认为未知 Bug 后，欢迎 [提交 Issue](https://github.com/BegoniaHe/LiteLoaderQQNT-Markdown/issues/new)，提交时请附上系统版本、QQNT 版本、LiteLoaderQQNT 版本信息截图及复现步骤。

## 贡献

欢迎提交 Pull Request。阅读代码前，建议先了解[项目架构文档](./docs/dev/architecture.md)与[渲染流程文档](./docs/dev/rendering_pipeline.md)。

## 致谢

衷心感谢原项目 [Ikaleio/LiteLoaderQQNT-Markdown](https://github.com/Ikaleio/LiteLoaderQQNT-Markdown) 及其所有贡献者：

[![](https://contrib.rocks/image?repo=Ikaleio/LiteLoaderQQNT-Markdown)](https://github.com/Ikaleio/LiteLoaderQQNT-Markdown/graphs/contributors)

## Star 历史

![Stargazers over time](https://starchart.cc/BegoniaHe/LiteLoaderQQNT-Markdown.svg?variant=adaptive)

如果本项目对您有帮助，欢迎点 Star 支持 ⭐
