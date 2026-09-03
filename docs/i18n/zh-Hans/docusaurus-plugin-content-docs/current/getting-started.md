---
id: getting-started
title: 快速开始
sidebar_position: 2
---

# 快速开始

## 安装 CLI

```bash
pnpm add -g @marsquakes/cli
```

npm 包名是 `@marsquakes/cli`，但它安装的命令叫 `mars`：

```bash
mars --help
```

:::tip
不想全局安装？也可以直接用 `pnpm dlx @marsquakes/cli create my-app`，而且每次
都会取到最新版本。
:::

CLI 本身只要求 Node >= 22.12.0 和 pnpm >= 9。如果还没有 pnpm，用 Node 自带的
Corepack 启用即可：

```bash
corepack enable pnpm
```

## 创建项目

```bash
mars create my-app
```

命令会询问你要包含哪些端。`web-admin` 与 `api` 默认已勾选，其余都是
可选：

```
📋 Select platforms to create

  📱 Mobile:
   1. [ ] Android [developing]
   2. [ ] iOS [developing]

  🖥️ Desktop:
   3. [ ] Windows [developing]
   4. [ ] Linux [developing]
   5. [ ] macOS [developing]
   6. [ ] Desktop
         Tauri (Win / macOS / Linux)

  🌐 Web:
   7. [ ] Web Client [developing]
   8. [✓] Web Admin
         Backend administration system

  ⚙️ API:
   9. [✓] API Service
         RESTful API service
```

在交互式终端里，用 `↑` `↓` 移动、`space` 勾选、`enter` 确认。如果 CLI 检测不到
TTY（比如 CI 任务，或编辑器内置的终端），会退化成上面这种编号列表：输入想要切换
的编号，`a` 表示全选，`n` 表示全不选，直接回车则接受默认值。

想完全跳过询问、直接使用这两个默认端：

```bash
mars create my-app --non-interactive
```

`create` 没有 `--platform` 参数，其他组合都只能通过交互选择完成。
[配合 AI Agent 使用](./ai-agents.md) 详细说明了交互的输入语法，以及 Agent
应该怎么驱动它。

## 开始开发

```bash
cd my-app
pnpm install
mars dev
```

`mars dev` 读取 `platforms.json`，并行启动所有已启用的端。只想跑其中一个：

```bash
mars dev --platform web-admin
mars dev --platform api --docker    # 无需本地 JDK 或 Maven
```

## 构建

```bash
mars build                          # 所有已启用的端
mars build --platform web-admin
mars build --platform api --docker
```

## 各端的工具链

CLI 本身只需要 Node 和 pnpm。你每启用一个端，就会多一项要求 —— 但仅限于在**本机**
构建该端时。[Docker 工作流](./docker.md)可以免掉其中大部分。

| 端 | 本机需要 | 可用 Docker 规避 |
| -- | -------- | ---------------- |
| `api` | JDK 17 + Maven 3.9+ | 可以 |
| `web-admin`、`web` | Node >= 22.12.0、pnpm 9.15.x | 可以 |
| `desktop` | Rust stable + Tauri 依赖 | 不可以 |
| `android` | JDK 17 + Android SDK | 不可以 |
| `ios` | Xcode（仅 macOS） | 不可以 |

在生成的项目里执行 `mars init`，可以安装依赖并检查上面这些工具缺了哪些。

## 更新已有项目

之前创建的项目，可以把后续对构建接线的改进同步进来：

```bash
cd my-app
mars update
```

它会刷新 `AGENTS.md`、`turbo.json`、`pnpm-workspace.yaml`、`platforms.json`、
`package.json`、`scripts/` 和 `packages/`，并且刻意**跳过** `apps/`、`docs/`、
`.docs/`、`design/`，所以业务代码与文档不会被动。任何改动之前，被替换的文件都
会先备份到 `.mars-update-backup`。

## 使用其他模板

`mars create` 默认使用官方模板，但你可以指向任何地方：

```bash
mars create my-app --template https://github.com/you/your-template.git
mars create my-app --from ../local-template
```

`--from` 也是在不发布的前提下测试模板改动的方式。

## 输出语言

所有命令都接受 `--lang`：

```bash
mars create my-app --lang zh
```

目前仅支持 `en`（默认）与 `zh`。
