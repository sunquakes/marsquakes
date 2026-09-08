---
id: cli
title: CLI 参考
sidebar_position: 3
---

# `mars` CLI 参考

npm 包名是 **`@marsquakes/cli`**，它安装的可执行命令是 **`mars`**。

```bash
pnpm add -g @marsquakes/cli
mars <command> [options]
```

## 命令

| 命令 | 说明 |
| ---- | ---- |
| `create <project-name>` | 从模板创建新项目 |
| `update` | 从模板更新构建接线，保留 `apps/`、`docs/`、`.docs/`、`design/` |
| `dev` | 启动开发（默认：所有已启用的端） |
| `build` | 构建（默认：所有已启用的端） |
| `init` | 安装依赖，然后按你的勾选校验并安装对应工具链 |
| `clean` | 清理所有构建产物 |

除 `create` 外，其余命令都必须在生成的项目**内部**运行。CLI 会从当前目录逐级
向上查找 `package.json`、`AGENTS.md` 或 `turbo.json` 来定位项目根目录。

## 参数

| 参数 | 适用命令 | 说明 |
| ---- | -------- | ---- |
| `--template <url>` | `create` | 使用某个 git 仓库作为模板 |
| `--from <path>` | `create` | 使用本地目录作为模板 |
| `-n`、`--non-interactive` | `create` | 直接采用默认的端选择 |
| `--platform <platform>` | `dev`、`build` | 只处理指定的端 |
| `--docker` | `dev`、`build` | 在 Docker 容器内运行 |
| `--docker` | `init` | 声明 API 跑在容器里，从而跳过宿主机的 JDK/Maven |
| `--lang <en\|zh>` | 全部 | 输出语言（默认 `en`） |
| `--help` | 全部 | 显示帮助 |

## `mars create`

```bash
mars create my-app
mars create my-app --non-interactive
mars create my-app --template https://github.com/you/template.git
mars create my-app --from ../local-template
```

### 模板解析顺序

CLI 按以下顺序确定模板来源，命中即停止：

1. `--from <path>` —— 本地目录。
2. `--template <url>` —— git 仓库，使用浅克隆。
3. **当前目录**，前提是它看起来像一个 Marsquakes 项目。这要求
   `package.json`、`AGENTS.md`、`turbo.json` **三者齐全** —— 比其他命令定位项目
   根目录时的判断更严格，正是为了避免在无关目录里执行 `mars create` 时把该目录
   悄悄复制过去。
4. 官方模板 `https://github.com/sunquakes/marsquakes.git`。

### 端的选择

| 端 | 分类 | 默认勾选 | 可选中 | 勾选会带来的工具链 |
| -- | ---- | -------- | ------ | ------------------ |
| `web-admin` | web | 是 | 是 | — |
| `api` | api | 是 | 是 | Docker、JDK、Maven |
| `desktop` | desktop | 否 | 是 | Rust |
| `web` | web | 否 | 否 | — |
| `android` | mobile | 否 | 否 | JDK、Android CLI |
| `ios` | mobile | 否 | 否 | — |
| `windows` | desktop | 否 | 否 | — |
| `linux` | desktop | 否 | 否 | — |
| `macos` | desktop | 否 | 否 | — |

最后一列才是 `create` 结束之后仍然生效的部分。一次勾选决定的既是哪个
`apps/<name>` 目录会被复制进来，**也是** [`mars init`](#mars-init) 之后要在你机器
上探测并安装什么。所以选择界面会把这一列以 `↳ toolchain:` 的形式显示在每一行旁
边，让你在勾之前就看到代价。空格表示这个端除了你已经有的 Node 和 pnpm 之外不再
需要任何东西 —— 要么它用基础工具就能构建（`web`、`web-admin`），要么它依赖的是
版本管理器装不了的系统工具链（`ios` 需要 Xcode，`windows` 需要 MSVC，`linux`
需要 gcc）。

**默认勾选**和**可选中**在 `platforms.json` 里是两个不同的键：`enabled` 决定
这一项能不能被选（为 `false` 时会置灰并标上 `[developing]`），可选的 `default`
键决定它初始是否打勾。`desktop` 是目前唯一两者不同的端 —— 它是一个完整可用的
Tauri 应用，你可以主动勾上，只是不属于默认项目。不写 `default` 时会回退到
`enabled`。

`--non-interactive` 选中的正是上面这两个默认勾选的端。`create` **没有
`--platform` 参数**，因此其他任何组合都必须走交互。交互的输入语法见
[AI Agent](./ai-agents.md)。

而 `api` 正是这两个默认端之一，所以默认项目本身就需要 Docker、JDK 和 Maven ——
`-n` 跳过的是**交互**，不是安装。这条路径上 CLI 同样会打印推导出来的工具链集合，
所以即使没有任何界面可勾，后果也依然被讲明了。

未勾选的端根本不会被复制进新项目 —— 是直接跳过该目录，而不是先复制再删除。

### `create` 具体做了什么

1. 解析模板，复制除 `apps/` 以外的全部内容。
2. 只复制你勾选的那些 `apps/<name>` 目录。
3. 重写 `platforms.json`，让 `enabled` 与你的勾选一致。这也是让勾选在 `create`
   结束后继续生效的机制：后续每一条命令（包括 `mars init`）都从这个文件重新推导
   自己该做什么，而不是去读一份「你当时勾了什么」的记录。
4. 在生成的文件中替换项目名（`package.json`、`AGENTS.md`、`platforms.json`、
   compose 文件等）。
5. 删除模板自带的 `.git`，重新初始化仓库，并创建一条
   `init: create project from template` 提交。

随后它会打印接下来需要执行的三条命令：

```bash
cd my-app
mars init
mars dev
```

这里是 `mars init` 而不是 `pnpm install`，因为安装 npm 依赖只是你的勾选所要求的
前一半工作 —— 见下文。

## `mars update`

```bash
cd my-app
mars update
```

只刷新构建接线：

| 会更新 | 绝不触碰 |
| ------ | -------- |
| `AGENTS.md` | `apps/` |
| `turbo.json` | `docs/` |
| `pnpm-workspace.yaml` | `.docs/` |
| `platforms.json` | `design/` |
| `package.json` | |
| `scripts/`、`packages/` | |

被替换的文件会先备份到 `.mars-update-backup`。

## `mars dev`

```bash
mars dev                            # 并行启动所有已启用的端
mars dev --platform web-admin
```

Web 相关的 workspace 通过 Turborepo 启动。原生端则走各自的工具链 —— 目前只有
`android` 接好了脚本（`gradlew installDebug`）；`ios`、`windows`、`linux`、
`macos` 在原生方式下会提示“待完善”。

`api` 没有接 `dev` 脚本，而且**不是** pnpm workspace 成员，所以不在 `mars dev`
的覆盖范围里。请用 Maven 直接跑在宿主机上：

```bash
cd apps/api && mvn -pl jeecg-module-system/jeecg-system-start -am spring-boot:run
```

## `mars build`

```bash
mars build
mars build --platform web-admin
mars build --platform api --docker
```

`build` 目前实现了 `web`、`web-admin`、`desktop`、`android`。其他端会提示暂不
支持构建。

## `mars init`

```bash
mars init            # 依赖 + 你的勾选所要求的工具链
mars init --docker   # 同上，但 API 跑在容器里
```

这一步就是为 `create` 时的勾选付账的地方。`init` 读取 `platforms.json`，取其中已
启用端所需工具链的并集，然后按顺序处理：

1. 确认 pnpm 存在，然后为整个 workspace 执行 `pnpm install`。你不需要自己再跑
   `pnpm install` —— `init` 是**替代**它，而不是跟在它后面。
2. 如果启用了 `android`，执行 `gradlew --version` 预热 Gradle wrapper。
3. 打印推导出来的集合，并说明每一项的来源：

   ```
   🧰 Toolchain required by this project: Docker, JDK, Maven
      (derived from: API Service)
   ```

4. 逐个探测，每个结果打印一行 —— `✅` 带版本号，`⚠️` 表示低于版本下限，`❌`
   表示没找到。
5. 只安装探测结果不是 `ok` 的那些，走三条路径之一。
6. 如果启用了 `android`，再根据 `compileSdk` 推导并安装 Android SDK 包，同时把
   `sdk.dir` 写入 `local.properties`。

之所以有三条安装路径，是因为并非每个工具都能用同一种方式处理：

| 路径 | 工具 | 方式 |
| ---- | ---- | ---- |
| 版本管理器 | JDK、Maven、Rust | `mise use --global <pin>` |
| 官方安装器 | Android CLI | Google 自己的安装脚本，用户级，不需要管理员权限 |
| 只报告 | Docker | 打印名称并指向安装矩阵；系统服务不是版本管理器能装的东西 |

两个值得知道的结论：

- **集合会去重。** `api` 和 `android` 都要 JDK，但只会下载一个。
- **`init` 是幂等的。** 它每次都从当前的 `platforms.json` 重新推导，所以手动启用
  另一个端之后，做法就是再跑一次。探测为 `ok` 的工具不会被动。

`--docker` 的含义是「API 跑在容器里」，因此宿主机的 JDK 和 Maven 就不需要了。它
必须显式指定、绝不自动推断：文档里的默认方式是容器里只放 MySQL 和 Redis，API 本
身跑在宿主机上，所以「Docker 可用」并不能证明是哪种方式。这个开关的作用范围也是
收窄的 —— 在 `api` + `android` 的项目里只会跳过 Maven，JDK 仍然要装，因为 Gradle
跑在宿主机上。

凡是 `init` 装不了的东西，都会打印
`.agents/skills/marsquakes-setup/references/install-matrix.md` 的路径，那里有分操
作系统的安装命令和版本下限。另外，由于子进程改不了父 shell 的环境变量，安装成功后
它会提示你新开一个 shell，让工具进入 `PATH`。

## `mars clean`

```bash
mars clean     # 清理整个 workspace 的构建产物
```

## Docker 模式

`--docker` 是为 CI 和打包准备的。日常开发是自己的代码跑在宿主机上，容器里只留
MySQL 和 Redis —— 见[搭好环境](./ai-admin-env.md)。

`--docker` 在不同命令下含义不同，别混起来：

| 命令 | `--docker` 的作用 |
| ---- | ----------------- |
| `init` | 只是声明 API 将来跑在容器里，从而跳过宿主机的 JDK 和 Maven。不构建、不启动任何东西。 |
| `dev`、`build` | 真的为该端构建镜像，并把你的代码放进容器里跑。 |

本节剩下的内容只讲第二种含义。给 `dev` 或 `build` 加上 `--docker`，CLI 会：

1. 检查是否安装了 Docker。
2. 从 `platforms.json` 解析该端的目录（`dir`，默认 `apps/<platform>`）。
3. 按模式选择 Dockerfile 变体，并依次回退：

   | 模式 | 变体顺序 |
   | ---- | -------- |
   | `dev` | `Dockerfile.dev` → `Dockerfile.build` → `Dockerfile` |
   | `build` | `Dockerfile.build` → `Dockerfile` |

4. 以**仓库根目录**为构建上下文，构建 `marsquakes/<platform>:<mode>` 镜像。
5. 以 `marsquakes-<platform>-<mode>` 运行容器，`web`/`web-admin` 暴露 3100
   端口，`api` 暴露 8080 端口。

Dockerfile 的组织方式以及那些关键的基础镜像约束，见 [Docker](./docker.md)。

## 不安装直接运行

在模板仓库的克隆目录内：

```bash
node packages/mars-cli/bin/mars.js create my-app --from .
```

这是发布前验证模板改动最快的方式。
