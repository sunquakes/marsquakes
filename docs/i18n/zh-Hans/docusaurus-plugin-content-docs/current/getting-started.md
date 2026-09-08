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

一次勾选决定的是两件事，不是一件。它既决定哪些目录会进入你的项目，也决定
[`mars init`](#各端的工具链) 之后要校验并安装哪些工具链。所以每一行都会先把代价
写出来，再让你决定勾不勾：

```
📋 Select platforms to create

  🧰 Ticking a platform also opts into its toolchain: `mars init` checks it
     and installs what is missing. Tick nothing extra and nothing extra is
     downloaded.

  📱 Mobile:
   1. [ ] Android [developing]
         ↳ toolchain: JDK, Android CLI
   2. [ ] iOS [developing]

  🖥️ Desktop:
   3. [ ] Windows [developing]
   4. [ ] Linux [developing]
   5. [ ] macOS [developing]
   6. [ ] Desktop
         Tauri (Win / macOS / Linux)
         ↳ toolchain: Rust

  🌐 Web:
   7. [ ] Web Client [developing]
   8. [✓] Web Admin
         Backend administration system

  ⚙️ API:
   9. [✓] API Service
         RESTful API service
         ↳ toolchain: Docker, JDK, Maven

  Currently selected: 2 modules
  🧰 `mars init` will check/install: Docker, JDK, Maven
```

（加 `--lang zh` 可以让这些提示变成中文。）

最下面那行汇总会随勾选实时变化，并且和真正安装时一样做了去重：同时勾选 `api` 和
`android` 只会列出一个 JDK，因为实际只下载一次。没有 `↳ toolchain:` 那一行的端 ——
`web`、`web-admin`、`ios` 以及各个占位端 —— 除了你已经有的 Node 和 pnpm 之外不需要
任何额外东西。

在交互式终端里，用 `↑` `↓` 移动、`space` 勾选、`enter` 确认。如果 CLI 检测不到
TTY（比如 CI 任务，或编辑器内置的终端），会退化成上面这种编号列表：输入想要切换
的编号，`a` 表示全选，`n` 表示全不选，直接回车则接受默认值。

想完全跳过询问、直接使用这两个默认端：

```bash
mars create my-app --non-interactive
```

它会替你勾上 `web-admin` 和 `api`，所以这不是一条绕开安装的路 —— 选了 `api`，就等于
选了 `api` 的工具链。这条路径下 CLI 同样会把最终的工具链集合打印出来，即使没有出现
交互界面，代价也照样说清楚。

`create` 没有 `--platform` 参数，其他组合都只能通过交互选择完成。
[配合 AI Agent 使用](./ai-agents.md) 详细说明了交互的输入语法，以及 Agent
应该怎么驱动它。

## 开始开发

```bash
cd my-app
mars init
mars dev
```

`mars init` 就是把你的勾选真正落地的那一步：它先装 workspace 依赖，然后校验并安装
你这份勾选所隐含的工具链（具体覆盖范围见[各端的工具链](#各端的工具链)）。它是
**替代** `pnpm install` 而不是跟在它后面 —— `pnpm install` 由它自己执行。

`mars dev` 读取 `platforms.json`，并行启动所有已启用的端。只想跑其中一个：

```bash
mars dev --platform web-admin
```

跑 API 需要本机装 Maven。`api` 是一个 Maven 模块，不是 pnpm workspace 成员，
所以 `mars dev` 覆盖不到它：

```bash
cd apps/api && mvn -pl jeecg-module-system/jeecg-system-start -am spring-boot:run
```

MySQL 和 Redis 默认连 `127.0.0.1:3306` / `127.0.0.1:6379`，用下面命令启动：

```bash
docker compose -f docker-compose.infra.yml up -d
```

## 构建

```bash
mars build                          # 所有已启用的端
mars build --platform web-admin
mars build --platform api --docker
```

## 各端的工具链

CLI 本身只需要 Node 和 pnpm。你每启用一个端，就会多一项要求 —— 但仅限于在**本机**
构建该端时。[Docker 工作流](./docker.md)可以在 CI 和打包时免掉其中大部分。

这张表就是[创建项目](#创建项目)时选择界面上每行 `↳ toolchain:` 显示的那份对应关系。
可以把它当成勾选的价目表来看。

| 端 | 本机需要 | 可用 Docker 规避 | `mars init` 会装 |
| -- | -------- | ---------------- | ---------------- |
| `api` | JDK 17 + Maven 3.9+ | 可以（CI / 打包） | 会装 |
| `web-admin`、`web` | Node >= 22.12.0、pnpm 9.15.x | 可以 | 本来就有 |
| `desktop` | Rust stable + Tauri 依赖 | 不可以 | Rust 会装，系统库不会 |
| `android` | JDK 17 + Android SDK | 不可以 | JDK 会装，SDK 不会 |
| `ios` | Xcode（仅 macOS） | 不可以 | 不会 |

这些不需要提前装好。在项目目录里执行 `mars init`，它会自己算出哪些用得上：

```bash
cd my-app
mars init
```

它先安装 workspace 依赖，然后读 `platforms.json`，只检测已启用的端真正需要的工具链，
再用 [mise](https://mise.jdx.dev) 把缺的补上。所以一个纯 Web 项目根本不会下载任何语言
工具链。

`platforms.json` 里存的正是你当初勾选的那些端，所以真正驱动这一步的就是那些勾选。
`mars init` 会顺带说明每项工具链的来源，这样当出现意料之外的下载时，你能一路追回到
是哪一行勾选要求的：

```
🧰 Toolchain required by this project: Docker, JDK, Maven
   (derived from: API Service)
```

如果 API 只会跑在容器里，那就明确说出来，本机的 JDK 和 Maven 也一并跳过：

```bash
mars init --docker
```

这件事是要你主动声明的，不是自动判断的：装了 Docker 并不等于 API 就跑在里面 ——
[Docker 页面](./docker.md)的做法是 MySQL 和 Redis 跑容器、API 留在本机，这种组合仍然
需要本机的 JDK。而在 `api` + `android` 的项目里，只有 Maven 会被跳过：Gradle 跑在本机，
所以 JDK 照装。

有三样东西它只报告、不安装，因为 mise 管不了系统服务、GUI 程序和 C 语言库：**Docker**、
**Android SDK** 和 **Tauri 的系统依赖**。跑 `mars init` 之前先把 mise 装好 —— 没有它，
上面说的全部都只会变成报告，而不会真的装上。

### 后来又加了一个端

在 `platforms.json` 里启用新的端之后，再跑一次 `mars init`：

```bash
mars init
```

它会重新读这个文件，把新端需要的工具链补上，已经有的跳过。重复跑永远是安全的，
而且这就是唯一需要做的事 —— 没有另外一条"安装 Rust 工具链"的命令要记。

这正是"按需推导"而不是"一次装完"的实际理由。一次装完得到的是一张**快照**：它只对
执行那一天存在的端是正确的，而三个月后你启用 `desktop`，没有任何机制会发现这张快照
已经过期了。`mars init` 描述的是"现在应该是什么状态"，所以"变了怎么办"的答案永远
只有一句：再跑一次。

### 什么时候一次装完反而更好

三种情况，它们的共同点是：这台机器要干什么在事前就已经定了，所以并不存在猜。

| 情况 | 为什么预装更好 |
| ---- | -------------- |
| CI 机器和 Docker 镜像 | 镜像的用途本身就固定了它要构建什么。工具链烧进层里可以被缓存，运行时不需要联网 —— [Docker 工作流](./docker.md)就是这么做的 |
| 离线或只有内网的机器 | 按需安装假设了 `mars init` 那一刻能下载。趁还能联网的时候装好 |
| 统一发的团队机器、教学机器 | 机器一模一样本身就是目标，机器之间的差异不是要保留的东西 |

在你自己的电脑上手动装个 JDK 或 Rust 当然也没问题。重点是笔记本上**没有人需要提前
决定** —— 因为 `platforms.json` 稍后会回答这个问题，而且答得更准。

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
