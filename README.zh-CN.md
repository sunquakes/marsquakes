<p align="center">
  <img src="https://marsquakes.cc/img/logo.svg" alt="Marsquakes logo" width="120" />
</p>

<h1 align="center">Marsquakes</h1>

[English](./README.md) | **简体中文**

> 一个用于生成多端 monorepo 的 npm 包。装一次，运行 `mars create`，勾选需要的端，就能得到一个可运行的仓库 —— 后端 API、管理后台、桌面端与移动端已经由 pnpm workspace + Turborepo 串联好。

[![npm](https://img.shields.io/npm/v/@marsquakes/cli.svg)](https://www.npmjs.com/package/@marsquakes/cli)
[![license](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)

## 快速开始

```bash
pnpm add -g @marsquakes/cli
mars create my-app
cd my-app
mars init
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
  macOS。没勾选的平台不会被复制，生成出来的仓库因此保持精简 —— 它们的工具链同样
  不会被安装，你的机器也因此保持精简。
- **可运行的编排** —— `mars init` 之后直接 `mars dev`，所有启用的端并行启动，
  中间没有额外的接线步骤。
- **无需本地工具链的 Docker** —— `.build` 变体镜像在镜像内部从源码编译，因此全新
  检出的仓库既不需要宿主机装 JDK 和 Maven，也不需要装 Node。

所以每一次勾选，你同时认下了两件事：`apps/` 下多一个目录，以及你机器上多一套
工具链。`mars init` 会把你的勾选从 `platforms.json` 里读回来，并安装它所隐含的
那些工具 —— 每一项勾选的代价见下面的表格。

## 平台

| 平台      | 目录             | 技术栈                   | 默认勾选 | 需要的工具链         | 成熟度     |
| --------- | ---------------- | ------------------------ | -------- | -------------------- | ---------- |
| API       | `apps/api`       | JeecgBoot / Spring Boot  | 是       | Docker、JDK、Maven   | 可用       |
| Web Admin | `apps/web-admin` | Vue 3 + Vite             | 是       | —                    | 可用       |
| Desktop   | `apps/desktop`   | Tauri + React + Rust     | 否       | Rust                 | 可用       |
| Web       | `apps/web`       | 待定                     | 否       | —                    | 仅有骨架   |
| Android   | `apps/android`   | Kotlin + Jetpack Compose | 否       | JDK、Android CLI + SDK | 仅有骨架 |
| iOS       | `apps/ios`       | Swift + SwiftUI          | 否       | —                    | 仅有骨架   |
| Windows   | `apps/windows`   | 待定                     | 否       | —                    | 仅有骨架   |
| Linux     | `apps/linux`     | 待定                     | 否       | —                    | 仅有骨架   |
| macOS     | `apps/macos`     | 待定                     | 否       | —                    | 仅有骨架   |

「可用」表示该平台开箱即可构建、运行；「仅有骨架」表示目录与约定已经就位，但业务
代码还只是占位。

`mars init` 会把你已启用的各端在「需要的工具链」这一列上取并集，缺什么装什么，
所以 `api` + `android` 只会下载一个 JDK，而不是两个。`—` 表示这个平台除了你本来
就有的 Node 和 pnpm 之外不再需要别的东西 —— 要么它就是用这两样构建的（`web`、
`web-admin`），要么它依赖的是版本管理器装不了的系统工具链（`ios` 需要 Xcode、
`windows` 需要 MSVC、`linux` 需要 gcc）。

生成的项目有一个单一事实来源 `platforms.json`，它记录了每个平台的目录、技术栈以及
是否启用。`mars dev`、`mars build`、`mars clean` 都读取这个文件，而不是把路径写死
在代码里；`mars init` 要安装的工具链同样是从这个文件推导出来的 —— 所以事后启用一个
平台，再跑一次 `mars init` 就够了。

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
| `init`                  | 安装依赖，并安装已启用平台需要的工具链               |
| `clean`                 | 清理所有构建产物                                     |

`init` 是真正把你的勾选落到实处的命令：它读取 `platforms.json`，算出这些平台需要
哪些工具链，逐个校验版本是否达到下限，缺的就装上。事后启用了新平台，再跑一次。

| 选项                    | 适用于               | 说明                     |
| ----------------------- | -------------------- | ------------------------ |
| `--template <url>`      | `create`             | 使用某个 git 仓库作为模板 |
| `--from <path>`         | `create`             | 使用本地目录作为模板     |
| `-n, --non-interactive` | `create`             | 接受默认的平台勾选       |
| `--platform <platform>` | `dev`/`build`        | 只作用于某一个平台       |
| `--docker`              | `init`/`dev`/`build` | 让 API 平台走 Docker     |
| `--lang <en\|zh>`       | 全部                 | 输出语言（默认 `en`）    |
| `--help`                | 全部                 | 显示帮助                 |

平台取值：`web`、`web-admin`、`android`、`ios`、`api`、`windows`、`linux`、
`macos`、`all`。

`--docker` 在两处含义不同。在 `dev`/`build` 上它真的会构建镜像并在容器里跑代码；
在 `init` 上它只是**声明** API 将来跑在容器里，从而让 `init` 跳过宿主机的 JDK 和
Maven —— 但仅限于没有别的已启用平台也需要它们的情况，所以在 `api` + `android` 的
项目里 Maven 会被跳过，JDK 仍然会为 Gradle 装上。

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

其他的一切 —— JDK 17、Maven 3.9+、Rust、Android CLI + SDK、Docker 20.10+ —— 只有
在你启用对应平台时才需要，而且不用你手工装：`mars init` 会按你的勾选推导出清单并
安装它们。Docker 工作流可以替代其中大部分。

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
pnpm run init                # 检查每个已启用平台需要的工具链
                             # （`mars init` 还会把缺的装上）

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

先复制环境变量模板。一共两份，区别只在依赖从哪里下载：

```bash
cp .env.example .env         # 官方源（默认）
cp .env.example.cn .env      # 国内镜像源
```

复制完再改 `MYSQL_*` / `REDIS_*` / `WEB_ADMIN_PORT`。两份模板声明的键和值完全一致，
所以之后想换源，改的是两个 URL，不需要重新整理 `.env`。

`.env` 里还有一个 `COMPOSE_PROJECT_NAME`，用来固定 compose 的项目名，避免它默认取
小写的目录名——否则换个目录名检出，整个项目就悄悄变成另一个项目了。它只能写在这里，
不能写进 YAML：compose v2.0.0 不支持顶层的 `name:` 字段。

两个 compose 文件，区别在于镜像本身是否编译源码：

```bash
# 全新检出 / 没有本地工具链：在镜像内部编译
docker compose -f docker-compose.build.yml up -d

# 产物已经编译好（jar + dist 存在）：只做打包，几秒完成
docker compose up -d
```

两个文件都是完整、可单独用一个 `-f` 运行的，因此 VS Code 的 Docker 插件可以直接
右键运行任意一个。它们都把 MySQL 与 Redis 视为**外部依赖**，通过
`host.docker.internal` 访问。

#### 依赖源

`docker-compose.build.yml` 在镜像内部编译，需要下载 npm 与 Maven 依赖。两个源默认都用
**官方源**，可以在 `.env` 里配置。选哪份模板，等价于选下面表格的哪一列：

| 变量 | `.env.example`（默认） | `.env.example.cn` |
|------|------------------------|-------------------|
| `NPM_REGISTRY` | `https://registry.npmjs.org` | `https://registry.npmmirror.com` |
| `MAVEN_MIRROR_URL` | `https://repo.maven.apache.org/maven2` | `https://maven.aliyun.com/repository/public` |

> 这两个是**构建期**变量，通过 `build.args` 传入，因此改了之后对已经构建好的镜像没有
> 任何影响，必须重新构建。另外裸 `docker build` 不会读 `.env`，只有
> `docker compose -f docker-compose.build.yml build` 和
> `mars build --platform <p> --docker` 能生效——后者会自己解析 `.env`，再以
> `--build-arg` 传进去。
>
> 注意 `NPM_REGISTRY` 管不了 pnpm lockfile 里已经写死的 `tarball:` 地址，因为构建用的是
> `pnpm install --frozen-lockfile`。要保证 lockfile 里没有 `tarball:` 字段，否则这个配置
> 会静默失效。
>
> 在国内网络下建议直接用 `.env.example.cn`，否则 Maven 拉依赖可能会非常慢甚至看起来卡住。

改完任意一份模板后跑一下 `pnpm check:env`——两份文件的键或值一旦不一致，它会直接报错。

如果希望数据库也跑在本地容器里，把基础服务叠加上去：

```bash
# 只起基础服务 —— 应用仍从 IDE 里跑，连这两个容器
docker compose -f docker-compose.infra.yml up -d

# 或者与应用栈一起启动
docker compose -f docker-compose.build.yml -f docker-compose.infra.yml up -d
```

MySQL 镜像内置了 `apps/api/db/jeecgboot-mysql-5.7.sql` 里的 JeecgBoot 表结构；初始化
脚本只在数据目录为空时执行，因此想重新导入需要先 `docker compose down -v`。同目录下的
`tables_nacos.sql` 和 `tables_xxl_job.sql` 只属于微服务部署，不会被初始化 —— 切到 cloud
模块时手动导入即可。

> 叠加使用时记得在 `.env` 里设置 `MYSQL_HOST=mysql` / `REDIS_HOST=redis` ——
> 默认值指向 `host.docker.internal`，不改的话 `api` 会绕开刚刚启动的容器而毫无提示。
> `.env.example` 里已经准备好这段注释掉的配置，取消注释即可。

| 服务        | 镜像                         | 端口                            |
| ----------- | ---------------------------- | ------------------------------- |
| `api`       | `marsquakes/api:3.9.3`       | `8080:8080`                     |
| `web-admin` | `marsquakes/web-admin:3.9.3` | `${WEB_ADMIN_PORT:-8807}:80`    |
| `mysql`     | `marsquakes/mysql:8.0.36`    | `${MYSQL_HOST_PORT:-3306}:3306` |
| `redis`     | `redis:7-alpine`             | `${REDIS_HOST_PORT:-6379}:6379` |

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
├── docker-compose.infra.yml    # 基础服务（MySQL + Redis），用 -f 叠加
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
