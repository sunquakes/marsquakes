---
id: ai-setup-agent
title: 安装 Agent
sidebar_position: 1
---

# 安装 Agent

Agent 就是跟你对话的那个程序。它负责替你打字——包括安装后面所有页面要用到的工具。
所以这一页是你唯一需要自己敲几条命令的地方。过了这一页，你基本就不用再敲命令了。

本系列文档使用 **DeepSeek Harness（命令 `dsh`）**。英文版同一页讲的是 OpenAI Codex
CLI——两条线是刻意选的不同工具，不是互译关系。

:::info 这一页需要打开终端
Windows 上叫 **PowerShell**，macOS 上叫 **终端**，Linux 上就是你系统里那个黑窗口。
复制下面的命令，粘贴进去，回车。这就是全部的操作了。
:::

## 1. 安装 Agent

本系列用 DeepSeek Harness，简称 dsh。它需要 Node.js 和 pnpm 才能运行，所以先装这两个：

```bash
mise use --global node@22
```

```bash
corepack enable pnpm
```

**你应该看到：** 两条命令都没有报错。之后可以用 `node -v` 确认，版本必须是 `v22.19.0`
或更高。

这里必须是 22，不能用更低的：很多电脑上现成装的是 Node 20，而 dsh 在 Node 20 上直接
装不上。这是这一页最容易踩的坑，所以第一条命令的作用就是先把版本换对。

然后安装 dsh 本体：

```bash
pnpm add -g @deepseek-ai/dsh
```

**你应该看到：** 安装结束后打印了一串东西，没有红色的错误文字。

验证一下：

```bash
dsh --version
```

**你应该看到：** 一个版本号。

:::warning 开发者预览版
dsh 处于 developer preview 阶段，命令和配置未来可能变化。跟本文不一致时，以
`dsh --help` 和[官方仓库](https://github.com/deepseek-ai/deepseek-harness)为准。
:::

## 2. 配置 API Key

Agent 需要一把钥匙才能工作。命令行和网页版读的是两个不同的位置：

| 使用方式 | 钥匙写在哪 |
| -------- | ---------- |
| 网页界面 | 界面里 Settings → Models，在页面上填就行 |
| 命令行 | 在 `~/.dsh/.credentials.yaml` 里 |

创建一个文件 `~/.dsh/.credentials.yaml`，内容如下（把 `sk-xxxxxxxxxxxxxxxx` 换成你自己的密钥）：

```yaml
DEEPSEEK_API_KEY: sk-xxxxxxxxxxxxxxxx
```

macOS / Linux 上需要收紧权限，否则 dsh 拒绝加载：

```bash
chmod 600 ~/.dsh/.credentials.yaml
```

验证钥匙是否生效：

```bash
dsh --profile headless "回复 ok"
```

**你应该看到：** 终端打印了一行回复，没有报错。如果报凭据缺失，说明 dsh 没读到你刚写的那个文件。

## 3. 启动

```bash
dsh web
```

**你应该看到：** 浏览器自动打开了一个页面，地址是 `http://127.0.0.1:3080`。

以后每次要用 Agent 时，先跑这条命令，等浏览器打开，然后就可以在网页里跟它对话了。

## 4. 站在正确的目录里

**dsh 把启动时所在的那个目录当作工作区根目录**——它只能看到和改动这个目录里的东西。

```bash
cd ~/projects                   # 要新建项目：站在新项目的「父目录」
dsh web
```

```bash
cd ~/projects/admin-platform    # 维护已有项目：站在项目里
dsh web
```

**你应该看到：** 让 Agent 执行 `pwd`，输出必须是你以为的那个目录。站错目录的典型症状是
Agent 声称创建成功了，但你在预期位置找不到目录——它建在别处了。

## 下一步

Agent 跑起来了，但它还不知道怎么装东西。
下一步[安装 Skill](./ai-setup.md)——之后剩下的环境准备就是一句提示词的事。