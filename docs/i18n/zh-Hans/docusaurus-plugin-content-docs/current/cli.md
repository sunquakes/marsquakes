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
| `init` | 安装依赖并检查环境 |
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

| 端 | 分类 | 默认启用 |
| -- | ---- | -------- |
| `web-admin` | web | 是 |
| `api` | api | 是 |
| `web` | web | 否 |
| `android` | mobile | 否 |
| `ios` | mobile | 否 |
| `desktop` | desktop | 否 |
| `windows` | desktop | 否 |
| `linux` | desktop | 否 |
| `macos` | desktop | 否 |

未勾选的端根本不会被复制进新项目 —— 是直接跳过该目录，而不是先复制再删除。

### `create` 具体做了什么

1. 解析模板，复制除 `apps/` 以外的全部内容。
2. 只复制你勾选的那些 `apps/<name>` 目录。
3. 重写 `platforms.json`，让 `enabled` 与你的勾选一致。
4. 在生成的文件中替换项目名（`package.json`、`AGENTS.md`、`platforms.json`、
   compose 文件等）。
5. 删除模板自带的 `.git`，重新初始化仓库，并创建一条
   `init: create project from template` 提交。

随后它会打印接下来需要执行的三条命令：

```bash
cd my-app
pnpm install
mars dev
```

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
mars dev --platform api --docker
```

Web 相关的 workspace 通过 Turborepo 启动。原生端则走各自的工具链 —— 目前只有
`android` 接好了脚本（`gradlew installDebug`）；`ios`、`api`、`windows`、
`linux`、`macos` 在原生方式下会提示“待完善”，因此 `api` 请使用 `--docker`。

## `mars build`

```bash
mars build
mars build --platform web-admin
mars build --platform api --docker
```

`build` 目前实现了 `web`、`web-admin`、`desktop`、`android`。其他端会提示暂不
支持构建。

## `mars init` / `mars clean`

```bash
mars init      # 安装依赖 + 检查每个已启用端的工具链
mars clean     # 清理整个 workspace 的构建产物
```

## Docker 模式

给 `dev` 或 `build` 加上 `--docker`，CLI 会：

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
