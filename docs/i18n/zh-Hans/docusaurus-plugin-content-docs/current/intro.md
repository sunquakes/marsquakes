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

`mars create` 复制一份真实可跑的模板，再按你勾选的端裁剪，而不是留给你一个
待填空的骨架：

- **可运行的后端** —— `apps/api`，基于 JDK 17 的 Spring Boot，既可用 Maven
  构建，也可完全在 Docker 内构建。
- **可运行的后台前端** —— `apps/web-admin`，Vue 3 + Vite，Docker 与 nginx
  配置都已写好。
- **可选的其他端** —— Web 客户端、Tauri 桌面端、Android、iOS、Windows、
  Linux、macOS。未勾选的端不会被复制，它们的工具链也不会被安装。
- **可用的编排能力** —— 先 `mars init`，再 `mars dev`，所有已启用的端
  并行启动，中间没有额外的接线步骤。

[`platforms.json`](./platforms.md) 是每个 `mars` 命令都读取的唯一事实来源，
所以之后启用某个端是改配置，而不是重构：

```
my-app/
├── apps/                    # 只包含你勾选的端
├── packages/                # 共享的 workspace 包
├── platforms.json           # 所有 mars 命令都读取的注册表
├── pnpm-workspace.yaml
├── turbo.json
└── AGENTS.md                # 项目约定，同时供 AI 编码助手读取
```

与直接克隆模板仓库不同，端在创建时就选好，而且之后仍可运行 `mars update`：
它把后续对构建接线的改进同步进已有项目，同时完全不动 `apps/`、`docs/`、
`.docs/` 和 `design/`。

## 路线

这条线由你自己按顺序敲每一条命令：

1. **[环境准备](./install.md)** —— 安装 Node 和 pnpm（仅有的前置要求），
   然后安装 `mars` CLI。
2. **[开始一个项目](./create-project.md)** —— 运行 `mars create`、勾选端，
   然后 `mars init` 安装它们隐含的工具链。
3. **构建一个应用** —— 每个端都有同样的三页：

   | 端 | 环境准备 | 如何开发 | 部署 |
   | -- | -------- | -------- | ---- |
   | 后台管理系统 | [环境准备](./guide-admin-env.md) | [如何开发](./guide-admin-develop.md) | [部署](./guide-admin-deploy.md) |
   | 桌面端 | [环境准备](./guide-desktop-env.md) | [如何开发](./guide-desktop-develop.md) | [部署](./guide-desktop-deploy.md) |
   | Android | [环境准备](./guide-android-env.md) | [如何开发](./guide-android-develop.md) | [部署](./guide-android-deploy.md) |

4. **参考** —— 需要时再查：
   [CLI](./cli.md) · [平台](./platforms.md) · [Docker](./docker.md) ·
   [约定](./conventions.md)。

更想用一句话描述需求、让 AI Agent 替你敲命令？改走 **AI 开发指南**，
从它的[简介](./ai-intro.md)开始。

## 环境要求

| 工具 | 版本 | 用途 |
| ---- | ---- | ---- |
| Node | >= 22.12.0 | 运行 `mars` CLI 本身 |
| pnpm | >= 9.0.0 | 在生成的项目中安装依赖 |

其余的 JDK、Maven、Rust、Android SDK，只有在你启用了对应端时才需要，而且不用
手工装：[`mars init`](./cli.md#mars-init) 会按你的勾选推导出清单并安装。

## 许可证

CLI 及模板接线部分以 Apache License 2.0 发布。`apps/` 下引入的第三方代码保留
各自上游许可证 —— `apps/api` 与 `apps/web-admin` 衍生自 JeecgBoot，
`apps/desktop` 是带有独立 `LICENSE` 的 git submodule。二次分发前请先查看对应
平台目录内的许可证文件。

## 作者

**Shing Rui** —— [sunquakes@outlook.com](mailto:sunquakes@outlook.com)
