---
id: create-project
title: 开始一个项目
---

# 开始一个项目

第二个阶段：创建项目、选择它包含哪些端，然后只安装这些端所隐含的工具链。请
按顺序执行下面的步骤；运行和构建在[第 3 步](#运行和构建项目)，各端的细节在
对应的平台页面。

## 第 1 步 —— 创建项目并勾选端 {#create-the-project}

```bash
mars create my-app
```

命令会询问你要包含哪些端。`web-admin` 与 `api` 默认已勾选，其余都是可选。
一次勾选决定两件事：哪些目录会进入你的项目，**以及**
[`mars init`](#initialize-the-project) 之后要校验并安装哪些工具链。每一行都会
先把代价写出来：

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

汇总行和真正安装时一样去重 —— 同时勾选 `api` 和 `android` 只列出一个 JDK；
没有 `↳ toolchain:` 那一行的端，除了你已有的 Node 和 pnpm 之外不需要任何额外
东西。交互式终端里用 `↑` `↓` 移动、`space` 勾选、`enter` 确认；检测不到 TTY
（CI 或编辑器内置终端）时输入编号切换，`a` 全选，`n` 全不选，`enter` 接受
默认值。

想跳过询问、直接使用两个默认端：

```bash
mars create my-app --non-interactive
```

它会替你勾上 `web-admin` 和 `api`（所以也就选了 `api` 的工具链）；其他组合
只能通过交互完成 —— `create` 没有 `--platform` 参数，输入语法见
[配合 AI Agent 使用](./ai-agents.md)。

### 你会得到什么 {#what-you-get}

`mars create` 复制一份真实可跑的模板，再按勾选裁剪，而不是待填空的骨架。未
勾选的端不会被复制，它们的工具链同样不会被安装。每个端包含什么见
[平台](./platforms.md#the-platform-matrix)，`create` 执行的确切步骤见
[CLI 参考](./cli.md#what-create-does)。

## 第 2 步 —— 初始化项目 {#initialize-the-project}

`create` 结束时会打印接下来的命令。进入项目并执行 `mars init`：

```bash
cd my-app
mars init
```

`pnpm install` 由 `mars init` 自己执行 —— 它**替代**这一步，所以不要再单独跑
`pnpm install`。随后它读取 `platforms.json`，只检测已启用的端真正需要的工具链，
再用 [mise](https://mise.jdx.dev) 把缺的补上；纯 Web 项目不会下载任何语言
工具链。每项下载都会说明来源，出现意料之外的下载时可以一路追回是哪一行要求的：

```
🧰 Toolchain required by this project: Docker, JDK, Maven
   (derived from: API Service)
```

如果 API 只会跑在容器里，可跳过宿主机的 JDK 和 Maven：

```bash
mars init --docker
```

这需要你主动声明，不会自动判断：装了 Docker 并不等于 API 就跑在里面 ——
[Docker 页面](./docker.md)的做法是 MySQL 和 Redis 跑容器、API 留在本机，这种
组合仍需要本机 JDK。在 `api` + `android` 项目里只有 Maven 会被跳过，因为
Gradle 跑在本机。

有三样东西它只**报告、不安装** —— 没有版本管理器管得了系统服务、GUI 程序和
C 语言库：**Docker**、**Android SDK** 和 **Tauri 的系统依赖**。跑 `mars init`
之前先装好 mise，否则它们全部只会被报告。安装成功后它会提示你打开一个新
终端，让工具进入 `PATH`。完整流程见 [`mars init`](./cli.md#mars-init)，包括
从 `compileSdk` 推导出的 Android SDK 包清单。

### 后来又加了一个端 {#adding-a-platform-later}

在 `platforms.json` 里启用新的端，再跑一次 `mars init`：

```bash
mars init
```

它只补装新端需要的东西，已有的跳过，所以重复跑是安全的，而且这就是唯一需要
做的事。`create` 时跳过的端从未被复制过，启用它还需要对应的 `apps/<platform>`
目录，见[创建之后再启用某个平台](./platforms.md#enabling-a-platform-after-creation)。
只要端的集合变了，再跑一次 `mars init` 就行。

### 什么时候一次装完反而更好 {#when-installing-everything-up-front-is-better}

个人笔记本上不需要提前决定任何事。当机器要干什么事前已经定了，则改为预装：

| 情况 | 为什么预装更好 |
| ---- | -------------- |
| CI 机器和 Docker 镜像 | 镜像的用途本身就固定了它要构建什么；工具链烧进层里可被缓存、运行时不需要联网 —— [Docker 工作流](./docker.md)就是这么做的 |
| 离线或只有内网的机器 | 按需安装假设了 `mars init` 那一刻能下载；趁还能联网时装好 |
| 统一发的团队机器、教学机器 | 机器一模一样本身就是目标，机器之间的差异不是要保留的东西 |

## 第 3 步 —— 运行和构建项目 {#运行和构建项目}

工作区级命令读取与 `init` 同一份 `platforms.json`，同时作用于每个已启用的端。

### 一次启动所有端

```bash
mars dev
```

只聚焦一个端：

```bash
mars dev --platform web-admin
```

Web 工作区通过 Turborepo 启动；原生平台用各自的工具链 —— 目前只有 `android`
接好了脚本（`gradlew installDebug`），`ios`、`windows`、`linux`、`macos`
会打印一条 "pending" 提示。`api` 是 Maven 模块而不是 pnpm 工作区成员，没有
`dev` 脚本，需要手动启动 —— 见各平台页面。

### 一次构建所有端

```bash
mars build                          # 每个已启用的端
mars build --platform web-admin
mars build --platform api --docker
```

`build` 已为 `web`、`web-admin`、`desktop` 和 `android` 实现；其他端会报告
暂不支持构建。`--docker` 改为在容器里构建和运行，而不是在本机 —— 见
[Docker](./docker.md)。

### 清理

```bash
mars clean
```

删除整个工作区的构建产物。

### 各端指南

每个已启用的应用都按同样三个阶段来写 —— 环境准备、如何开发、部署。"Ready"
的端开箱即可构建和运行；"Scaffold only" 的端预留了结构但仍是占位 —— 见
[平台](./platforms.md#the-platform-matrix)。

| 应用 | 成熟度 | 从这里开始 |
| ---- | ------ | ---------- |
| 后台管理系统 —— Web Admin + API（`apps/web-admin`、`apps/api`） | Ready | [环境准备](./guide-admin-env.md) |
| 桌面端（`apps/desktop`） | Ready | [环境准备](./guide-desktop-env.md) |
| Android（`apps/android`） | Scaffold only | [环境准备](./guide-android-env.md) |
| Web、iOS、Windows、Linux、macOS | Scaffold only | 见[平台矩阵](./platforms.md#the-platform-matrix) |

每个平台目录还带有各自的 `AGENTS.md`，包含构建命令、编码规范和注意事项，
动手改那个平台之前先读它。

## 第 4 步 —— 保持接线为最新

把后续对构建接线的改进拉进已有项目，而无需改动应用代码：

```bash
mars update
```

它会刷新 `AGENTS.md`、`turbo.json`、`pnpm-workspace.yaml`、`platforms.json`、
`package.json`、`scripts/` 和 `packages/`，并刻意跳过 `apps/`、`docs/`、
`.docs/` 和 `design/`。被替换的文件会先备份到 `.mars-update-backup`。见
[`mars update`](./cli.md#mars-update)。
