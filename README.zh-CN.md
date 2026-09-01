# Marsquakes

[English](./README.md) | **简体中文**

> 一个用于生成多端 monorepo 的 npm 包。装一次，运行 `mars create`，勾选需要的端，就能得到一个可运行的仓库 —— 后端 API、管理后台、桌面端与移动端已经由 pnpm workspace + Turborepo 串联好。

[![npm](https://img.shields.io/npm/v/@marsquakes/cli.svg)](https://www.npmjs.com/package/@marsquakes/cli)
[![license](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)

## 快速开始

```bash
pnpm add -g @marsquakes/cli
mars create my-app
cd my-app
pnpm install
mars dev
```

包名是 `@marsquakes/cli`，但它安装的命令叫 `mars`。
不想全局安装？`pnpm dlx @marsquakes/cli create my-app` 同样可用。

📖 **[完整文档](https://sunquakes.github.io/marsquakes/zh-Hans/)**

## 你会得到什么

`mars create` 生成的不是一个还要你自己填充的空架子。它复制的是一份真实可运行
的模板，并按你勾选的端做裁剪：

- **可运行的后端** —— `apps/api`，JDK 17 上的 Spring Boot，可以用 Maven 构建，
  也可以完全在 Docker 内构建。
- **可运行的管理后台** —— `apps/web-admin`，Vue 3 + Vite，Docker 与 nginx 配置
  都已经写好。
- **可选的其他端** —— Web 客户端、Tauri 桌面端、Android、iOS、Windows、Linux、
  macOS。没勾选的平台不会被复制，生成出来的仓库因此保持精简。
- **可运行的编排** —— `pnpm install` 之后直接 `mars dev`，所有启用的端并行启动，
  中间没有额外的接线步骤。
- **无需本地工具链的 Docker** —— `.build` 变体镜像在镜像内部从源码编译，因此全新
  检出的仓库既不需要宿主机装 JDK 和 Maven，也不需要装 Node。

## 平台

| 平台      | 目录             | 技术栈                   | 默认勾选 | 成熟度     |
| --------- | ---------------- | ------------------------ | -------- | ---------- |
| API       | `apps/api`       | JeecgBoot / Spring Boot  | 是       | 可用       |
| Web Admin | `apps/web-admin` | Vue 3 + Vite             | 是       | 可用       |
| Desktop   | `apps/desktop`   | Tauri + React + Rust     | 否       | 可用       |
| Web       | `apps/web`       | 待定                     | 否       | 仅有骨架   |
| Android   | `apps/android`   | Kotlin + Jetpack Compose | 否       | 仅有骨架   |
| iOS       | `apps/ios`       | Swift + SwiftUI          | 否       | 仅有骨架   |
| Windows   | `apps/windows`   | 待定                     | 否       | 仅有骨架   |
| Linux     | `apps/linux`     | 待定                     | 否       | 仅有骨架   |
| macOS     | `apps/macos`     | 待定                     | 否       | 仅有骨架   |

「可用」表示该平台开箱即可构建、运行；「仅有骨架」表示目录与约定已经就位，但业务
代码还只是占位。

生成的项目有一个单一事实来源 `platforms.json`，它记录了每个平台的目录、技术栈以及
是否启用。`mars dev`、`mars build`、`mars clean` 都读取这个文件，而不是把路径写死
在代码里。

## CLI 参考

```bash
mars <command> [options]
```

| 命令                    | 说明                                                 |
| ----------------------- | ---------------------------------------------------- |
| `create <project-name>` | 从模板创建新项目                                     |
| `update`                | 从模板更新项目（保留 `apps`/`docs`/`.docs`）         |
| `dev`                   | 启动开发（默认所有已启用的平台）                     |
| `build`                 | 构建（默认所有已启用的平台）                         |
| `init`                  | 安装依赖并检查环境                                   |
| `clean`                 | 清理所有构建产物                                     |

| 选项                    | 适用于        | 说明                     |
| ----------------------- | ------------- | ------------------------ |
| `--template <url>`      | `create`      | 使用某个 git 仓库作为模板 |
| `--from <path>`         | `create`      | 使用本地目录作为模板     |
| `-n, --non-interactive` | `create`      | 接受默认的平台勾选       |
| `--platform <platform>` | `dev`/`build` | 只作用于某一个平台       |
| `--docker`              | `dev`/`build` | 在 Docker 容器内运行     |
| `--lang <en\|zh>`       | 全部          | 输出语言（默认 `en`）    |
| `--help`                | 全部          | 显示帮助                 |

平台取值：`web`、`web-admin`、`android`、`ios`、`api`、`windows`、`linux`、
`macos`、`all`。

## 为什么是 CLI，而不是模板仓库

克隆模板仓库会把所有平台都塞给你，不管你要不要；而且从克隆那一刻起它就被冻结了。
`@marsquakes/cli` 有两点不同：

1. **按需生成** —— 创建时勾选平台，生成的仓库只包含这些平台。
2. **`mars update`** —— 把后续对构建配置（`turbo.json`、`platforms.json`、
   `packages/`、`scripts/`）的改进拉进已有项目，同时完全不碰 `apps/`、`docs/`、
   `.docs/` 和 `design/`。你的业务代码永远不会被覆盖。

## 环境要求

| 工具 | 版本    | 用途                     |
| ---- | ------- | ------------------------ |
| Node | >= 18   | 运行 `mars` CLI 本身     |
| pnpm | >= 9    | 安装并运行生成的项目     |

pnpm 是唯一受支持的包管理器。Node 自带 Corepack，执行 `corepack enable pnpm`
即可获得锁定的版本。

其他的一切 —— JDK 17、Maven 3.9+、Rust、Android SDK、Docker 20.10+ —— 只有在你
启用对应平台时才需要，而且 Docker 工作流可以替代其中大部分。

---

## 参与本仓库开发

以上内容描述的都是**生成出来的**项目。下面这部分面向的是要改动模板和 CLI 本身的人。

### 克隆

`apps/desktop` 是 git submodule，所以要递归克隆：

```bash
git clone --recursive https://github.com/sunquakes/marsquakes.git
cd marsquakes
```

已经克隆但漏了 `--recursive`？执行 `git submodule update --init --recursive`。

### 安装与运行

```bash
pnpm install
pnpm run init                # 安装依赖 + 检查每个已启用平台的工具链

pnpm dev                     # 并行启动所有已启用的平台
pnpm dev:web-admin           # 只启动管理后台
pnpm dev:desktop             # Tauri 应用
pnpm dev:android             # gradlew installDebug
pnpm dev:docs                # 文档站（不是平台，通过 pnpm -C docs 运行）

pnpm build                   # 构建所有 workspace 包（Turborepo 缓存）
pnpm lint
pnpm type-check
pnpm clean
```

### 不发布也能测试 CLI

```bash
node packages/mars-cli/bin/mars.js create my-project --from .
```

### Docker

先复制环境变量模板 —— MySQL 与 Redis 是这套栈的**外部依赖**：

```bash
cp .env.example .env         # 然后修改 MYSQL_* / REDIS_* / WEB_ADMIN_PORT
```

两个 compose 文件，区别在于镜像本身是否编译源码：

```bash
# 全新检出 / 没有本地工具链：在镜像内部编译
docker compose -f docker-compose.build.yml up -d

# 产物已经编译好（jar + dist 存在）：只做打包，几秒完成
docker compose up -d
```

两个文件都是完整、可单独用一个 `-f` 运行的，因此 VS Code 的 Docker 插件可以直接
右键运行任意一个。

| 服务        | 镜像                         | 端口                         |
| ----------- | ---------------------------- | ---------------------------- |
| `api`       | `marsquakes/api:3.9.3`       | `8080:8080`                  |
| `web-admin` | `marsquakes/web-admin:3.9.3` | `${WEB_ADMIN_PORT:-8807}:80` |

Dockerfile 与它所构建的代码放在一起，位于各自的平台目录内：

| 文件                          | 是否编译源码 | 用途                                       |
| ----------------------------- | ------------ | ------------------------------------------ |
| `<platform>/Dockerfile`       | 否           | 打包已经构建好的产物；产物不存在则失败     |
| `<platform>/Dockerfile.build` | 是           | 自包含的多阶段构建                         |
| `<platform>/Dockerfile.dev`   | 否           | 开发镜像，源码挂载，热更新                 |

> 构建上下文始终是仓库根目录，因此所有 `COPY` 都使用相对于仓库根的路径。基础镜像
> tag 被刻意固定在 glibc 2.31（`-focal` / `-bullseye`）—— 修改之前请先阅读
> [AGENTS.md](./AGENTS.md) 中的「Base Image Constraints」一节。

### 仓库结构

```
marsquakes/
├── apps/                       # 平台应用（模板的实际载荷）
│   ├── api/                    # 后端 API（JeecgBoot / Spring Boot）
│   ├── web-admin/              # 管理后台（Vue 3 + Vite）
│   ├── desktop/                # 桌面端（Tauri，git submodule）
│   ├── android/  ios/          # 移动端
│   └── windows/ linux/ macos/  # 原生桌面端
├── packages/                   # 共享 workspace 包
│   ├── mars-cli/               # 发布出去的 npm 包（@marsquakes/cli）
│   ├── eslint-config/          # 共享 ESLint 配置
│   └── tsconfig/               # 共享 tsconfig
├── docs/                       # 文档站（Docusaurus）
│   └── content/                # 发布的 Markdown 页面
├── .docs/                      # 内部设计文档（不发布）
│   ├── api/                    # 接口文档
│   └── task/                   # 任务文档与 PRD
├── design/                     # 设计稿、图片、切图
├── scripts/init.js             # 初始化脚本
├── platforms.json              # 平台注册表（启用状态 / 技术栈 / 目录）
├── pnpm-workspace.yaml         # workspace 成员
├── turbo.json                  # Turborepo 流水线
├── docker-compose.yml          # 默认栈（不含编译阶段）
├── docker-compose.build.yml    # 在镜像内编译的栈
├── .env.example                # 环境变量模板
└── AGENTS.md                   # 全局规范
```

### 约定

- **文档**：发布的页面放 `docs/content/`，内部设计文档放 `.docs/`（接口文档在
  `.docs/api/`，任务在 `.docs/task/`）；**设计资源**放 `design/`。任何一类都不要
  丢在仓库根目录。
- **提交信息必须用英文**，遵循 conventional commits（`feat:`、`fix:`、`docs:`、
  `style:`、`refactor:`、`test:`、`chore:`、`perf:`、`ci:`、`revert:`）。参见
  [.trae/rules/git-commit-message.md](./.trae/rules/git-commit-message.md)。
- **分支**：`main` 是主干，功能分支 `feature/xxx`，修复分支 `fix/xxx`。
- **代码注释一律用英文**，包括 Dockerfile 与 compose 文件。
- 每个平台目录都有自己的 `AGENTS.md`，写明该平台的专属规则 —— 动那个平台之前先读它。

## 许可证

[Apache-2.0](./LICENSE)

CLI 与模板的构建配置以 Apache License 2.0 发布。`apps/` 下引入的第三方代码保留其
上游许可证 —— `apps/api` 与 `apps/web-admin` 派生自 JeecgBoot，`apps/desktop` 是
带有自身 `LICENSE` 的 git submodule。再分发某个平台目录之前，请先查看其中的许可证
文件。

## 作者

**Shing Rui** —— <sunquakes@outlook.com>
