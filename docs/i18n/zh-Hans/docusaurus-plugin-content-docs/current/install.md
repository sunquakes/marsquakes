---
id: install
title: 环境准备
---

# 环境准备

这是第一个阶段。此时你的机器上还没有项目，所以唯一要装的就是用来创建项目的
工具。项目需要的语言运行时 —— JDK、Maven、Rust、Android SDK —— 留到之后由
[`mars init`](./create-project#initialize-the-project) 安装：等需要它们的端
真正存在之后再说。

## 要求

| 工具 | 版本 | 用途 |
| ---- | ---- | ---- |
| Node | >= 22.12.0 | 运行 `mars` CLI 本身 |
| pnpm | >= 9.0.0 | 在生成的项目中安装依赖 |

这两个是仅有的前置要求。

## 第 1 步 —— 启用 pnpm

如果还没有 pnpm，用 Node 自带的 Corepack shim 启用：

```bash
corepack enable pnpm
```

其余的一切 —— JDK、Maven、Rust、Android SDK —— 都在[开始一个项目](./create-project.md)
阶段按你勾选的端推导安装。

## 第 2 步 —— 安装 CLI

```bash
pnpm add -g @marsquakes/cli
```

npm 包名是 `@marsquakes/cli`，但它安装的命令叫 `mars`：

```bash
mars --help
```

:::tip
不想全局安装？`pnpm dlx @marsquakes/cli create my-app` 同样可用，而且每次都会
取到最新版本。
:::

## 第 3 步 —— 验证

下面两条命令报出的版本号都应满足上表要求：

```bash
node --version
pnpm --version
```

如果全局安装之后找不到 `mars`，打开一个新终端 —— 刚装好的全局 bin 目录不在
此前已经开着的 shell 的 `PATH` 里。

## 下一步

CLI 就位之后，就可以[开始一个项目](./create-project.md)了。
