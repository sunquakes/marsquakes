---
id: intro
title: 简介
slug: /
sidebar_position: 1
---

# Marsquakes

> 一个用于生成多端 monorepo 的 npm 包。全局安装一次，执行 `mars create`，
> 勾选需要的端，你就能得到一个可直接运行的仓库 —— 后端 API、后台前端、
> 桌面端与移动端，已经由 pnpm workspace + Turborepo 串联好。

```bash
pnpm add -g @marsquakes/cli
mars create my-app
```

## 你会得到什么

`mars create` 生成的不是需要你继续填空的骨架，而是复制一份真实可跑的模板，
再按你勾选的端裁剪：

- **可运行的后端** —— `apps/api`，基于 JDK 17 的 Spring Boot，既可用 Maven
  构建，也可完全在 Docker 内构建。
- **可运行的后台前端** —— `apps/web-admin`，Vue 3 + Vite，Docker 与 nginx
  配置都已写好。
- **可选的其他端** —— Web 客户端、Tauri 桌面端、Android、iOS、Windows、
  Linux、macOS。这些在 `mars create` 时由你选择；未勾选的端不会被复制，
  生成出来的仓库因此保持精简。
- **可用的编排能力** —— `pnpm install` 之后直接 `mars dev`，所有已启用的端
  并行启动，中间没有额外的接线步骤。

## 各部分如何协作

生成的项目以 `platforms.json` 作为唯一事实来源，记录每个端的目录、技术栈以及
是否启用。`mars dev`、`mars build`、`mars clean` 都读取这个文件，而不是把路径
写死 —— 所以之后要启用某个端，是改配置，而不是重构。

```
my-app/
├── apps/                    # 只包含你勾选的端
├── packages/                # 共享的 workspace 包
├── platforms.json           # 所有 mars 命令都读取的注册表
├── pnpm-workspace.yaml
├── turbo.json
└── AGENTS.md                # 项目约定，同时供 AI 编码助手读取
```

## 为什么做成 CLI，而不是模板仓库

直接克隆模板仓库，会把所有端一并带上（不管你要不要），而且会把你固定在克隆的
那一刻。`@marsquakes/cli` 有两点不同：

1. **按需生成** —— 创建时勾选端，生成的仓库只包含这些端。
2. **`mars update`** —— 可以把后续对构建接线的改进（`turbo.json`、
   `platforms.json`、`packages/`、`scripts/`）同步进已有项目，同时完全不动
   `apps/`、`docs/`、`.docs/` 和 `design/`。你的业务代码永远不会被覆盖。

## 下一步读什么

| 页面 | 内容 |
| ---- | ---- |
| [快速开始](./getting-started.md) | 安装 CLI 并创建第一个项目 |
| [CLI](./cli.md) | 完整的 `mars` 命令与参数参考 |
| [平台](./platforms.md) | 每个端包含什么，以及 `platforms.json` 的作用 |
| [Docker](./docker.md) | 不装本地 JDK / Node 工具链也能构建运行 |
| [约定](./conventions.md) | 目录规则、提交信息、分支 |

## 环境要求

| 工具 | 版本 | 用途 |
| ---- | ---- | ---- |
| Node | >= 18 | 运行 `mars` CLI 本身 |
| pnpm | 9.15.x | 在生成的项目中安装依赖 |

其余的 JDK、Maven、Rust、Android SDK，只有在你启用了对应的端时才需要，而且
[Docker 工作流](./docker.md)可以替代其中大部分。

## 许可证

CLI 及模板接线部分以 Apache License 2.0 发布。`apps/` 下引入的第三方代码保留
各自上游许可证 —— `apps/api` 与 `apps/web-admin` 衍生自 JeecgBoot，
`apps/desktop` 是带有独立 `LICENSE` 的 git submodule。二次分发前请先查看对应
平台目录内的许可证文件。

## 作者

**Shing Rui** —— [sunquakes@outlook.com](mailto:sunquakes@outlook.com)
