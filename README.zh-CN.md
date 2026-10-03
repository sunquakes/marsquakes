<p align="center">
  <img src="https://marsquakes.cc/img/logo.svg" alt="Marsquakes logo" width="120" />
</p>

<h1 align="center">Marsquakes</h1>

[English](./README.md) | **简体中文**

[![npm](https://img.shields.io/npm/v/@marsquakes/cli.svg)](https://www.npmjs.com/package/@marsquakes/cli)
[![license](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)

**每个人，都能成为全栈工程师。**

Marsquakes 是一款免费工具，让一个人就能做出完整的应用，并发布到手机、电脑和
网页各个端 —— 不需要后端团队，也不需要运维工程师。困难的接线工作都已替你做好，
你可以把时间花在产品本身。

---

## 用大白话说，这是什么？

想象你要上线一个在线产品。一个"真正"的产品通常需要好几块由专人手工搭建的部分：

- 一个**服务器**，用来存储数据、管理账号；
- 一个**管理后台页面**，用来管理这些数据；
- 一个 **Android 应用**、一个 **iPhone 应用**，可能还要一个**桌面程序**。

让这些部分彼此连通，过去通常需要一整个团队。Marsquakes 把它们**全部连好、协同
工作**之后交到你手上。你只需回答几个简单的问题（"需要 Android 吗？要桌面端吗？"），
它就会组装出一个开箱可运行、且只包含你所需内容的项目。

你不需要先懂服务器、数据库或构建系统，就能开始。

## 它适合谁？

- 想快速验证一个想法的**创业者和独立开发者**。
- 能描述需求、让 **AI 编程助手**代为实现的设计师和产品人员。
- 想了解一个完整产品如何拼装的**学生和初学者**。
- 只是想跳过繁琐环境配置的**程序员**。

## 你能交付什么

| 部分           | 它替你做的事                                 | 状态         |
| -------------- | -------------------------------------------- | ------------ |
| 后端 API       | 开箱即可存储数据、管理账号和登录             | 可用         |
| 管理后台       | 一个可查看、管理数据的网页界面               | 可用         |
| 桌面应用       | 一个程序同时跑在 Windows、macOS 和 Linux 上  | 可用         |
| Android 应用   | 可安装的手机应用，含首页、搜索和设置         | 可用         |
| iPhone / 其他  | 已在规划 —— 结构已就位，页面开发中           | 即将推出     |

「可用」表示生成的那一刻就能构建、运行。每一个页面和功能你都仍然可以修改；
这些都是真实的应用，不是锁死的演示。

Android 应用甚至支持两种用法：**独立模式**完全不需要服务器就能运行；**联网模式**
则对接你的真实后端完成登录。

## 四行命令开始

```bash
pnpm add -g @marsquakes/cli
mars create my-app
cd my-app
mars init
```

然后打开项目，告诉 AI 编程助手你想做什么 —— 或者运行 `mars dev`，看着所有部分
一起启动。

包名叫 `@marsquakes/cli`，但你输入的命令是 `mars`。
不想全局安装？`pnpm dlx @marsquakes/cli create my-app` 同样可用。

📖 **阅读完整指南：[marsquakes.cc](https://marsquakes.cc/zh-Hans/)**

指南分为两条线：写给人看的 **Guide**，和写给 AI Agent 看的 **AI Guide** ——
如果你正配合 AI 助手工作，把 AI Guide 指给它，它就清楚该怎么做。

## 常见问题

**我需要会写代码吗？**
不需要太多。Marsquakes 已经省去了环境配置，AI 编程助手可以帮你写功能。你主要
需要把想要的东西描述清楚。

**是不是要装一大堆复杂的软件？**
只需要两个免费的基础工具：Node 和 pnpm。所选平台需要的其他一切都由 `mars init`
自动安装 —— 你还可以在 Docker 内构建，连这些都省掉。

**会不会被迫包含我不想要的平台？**
不会。创建时你来勾选，没选的平台不会被复制，对应的软件也不会被安装。你可以事后
再开启某个平台，重新运行 `mars init` 即可。

**以后更新会不会弄丢我的代码？**
不会。`mars update` 会拉取对构建配置的改进，但完全不碰你的业务代码。

**它收费吗？**
Marsquakes 本身免费，基于 Apache 2.0 协议开源。你只需为产品本身选择使用的托管或
应用商店费用买单。

---

## 面向开发者

以上描述的都是 Marsquakes 生成的项目。这一小节面向的是要改动 Marsquakes 本身的人。

**命令**

```bash
mars create <name>   # 生成项目（参数：--template、--from、-n）
mars init            # 安装依赖 + 已启用平台所需的工具链
mars dev             # 启动所有已启用平台（或 --platform <名称>）
mars build           # 构建所有已启用平台
mars update          # 刷新构建配置，保留 apps/ 和你的代码
mars clean           # 清理构建产物
```

`platforms.json` 是单一事实来源，记录每个平台、目录以及是否启用；所有命令都从它
推导行为。加上 `--docker` 可在容器内构建或运行，`--lang en|zh` 可切换输出语言。

**参与本仓库开发**

`apps/desktop` 是 git submodule，需要递归克隆：

```bash
git clone --recursive https://github.com/sunquakes/marsquakes.git
pnpm install
pnpm run init
```

不发布也能测试 CLI：

```bash
node packages/mars-cli/bin/mars.js create my-project --from .
```

完整的 Docker、工具链与 CI 细节见 [AGENTS.md](./AGENTS.md)，每个平台目录也有各自的
`AGENTS.md`。改动哪个平台，就读对应那一份。

## 许可证

[Apache-2.0](./LICENSE) —— CLI 与构建配置。`apps/` 下引入的第三方代码保留其上游
许可证；再分发某个平台目录之前，请先查看其中的许可证文件。

## 作者

**Shing Rui** —— <sunquakes@outlook.com>
