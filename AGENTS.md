# Marsquakes - AGENTS.md

## 项目概览

- **项目名称**: Marsquakes
- **多平台项目**: Android / iOS / Web / API / Windows / Linux / macOS
- **Monorepo 工具**: pnpm workspace + Turborepo
- **平台配置**: `platforms.json`（定义启用平台及技术栈，AI 据此自动生成目录）

## 目录规则（全局生效）

### Work 模式
- 所有文档、任务、PRD **必须**生成在 `./docs/` 或 `./docs/task/` 目录下
- **API 接口文档** **必须**生成在 `./docs/api/` 目录下
- 禁止将文档类文件散落在项目根目录或其他位置

### Design 模式
- 所有设计稿、图片、页面、切图 **必须**生成在 `./design/` 及其子目录下
- 禁止将设计类文件散落在项目根目录或其他位置

### 平台代码目录
- **移动端**: `./apps/android/`、`./apps/ios/`
- **桌面端**: `./apps/windows/`、`./apps/linux/`、`./apps/macos/`
- **Web 用户端**: `./apps/web/`
- **Web 后台管理**: `./apps/web-admin/`
- **后端接口**: `./apps/api/`

### 通用禁止项
- **禁止**在项目根目录直接生成设计文件或文档文件
- 临时文件、脚本等中间产物应放置在系统临时目录，不应污染项目目录

## 项目结构约定

```
Marsquakes/
├── apps/                    # 所有平台应用
│   ├── android/             # Android 端（Gradle，详见 apps/android/AGENTS.md）
│   ├── ios/                 # iOS 端（Xcode，详见 apps/ios/AGENTS.md）
│   ├── windows/             # Windows 桌面端（详见 apps/windows/AGENTS.md）
│   ├── linux/               # Linux 桌面端（详见 apps/linux/AGENTS.md）
│   ├── macos/               # macOS 桌面端（详见 apps/macos/AGENTS.md）
│   ├── web/                 # Web 用户端（pnpm workspace 成员，详见 apps/web/AGENTS.md）
│   ├── web-admin/           # Web 后台管理（pnpm workspace 成员，详见 apps/web-admin/AGENTS.md）
│   └── api/                 # 后端接口（详见 apps/api/AGENTS.md）
├── packages/                # 共享包（pnpm workspace 成员）
│   ├── tsconfig/            # 共享 tsconfig
│   ├── eslint-config/       # 共享 ESLint 配置
│   └── mars-cli/            # CLI 脚手架工具（命令：mars）
├── docs/                    # 文档、任务、PRD
│   ├── task/                # 任务文档
│   └── api/                 # API 接口文档
├── design/                  # 设计稿、图片、切图
├── scripts/                 # 初始化及工具脚本
│   └── init.js              # 一键初始化脚本
├── package.json             # 顶层命令入口
├── pnpm-workspace.yaml      # pnpm workspace 配置
├── turbo.json               # Turborepo 管道配置
├── platforms.json           # 平台配置（启用/禁用平台及技术栈）
├── AGENTS.md                # 本文件（全局规则）
└── .gitignore
```

## CLI 脚手架

本项目提供 `mars` CLI 工具，可全局安装后快速创建新项目。

### 安装

```bash
npm install -g @marsquakes/cli
```

### 创建项目

```bash
mars create my-project
mars create my-project --template <git-url>
mars create my-project --from <local-path>
```

### 开发 & 构建

在项目目录下运行（自动读取 `platforms.json` 判断启用平台）：

```bash
mars dev                           # 启动所有已启用平台
mars dev --platform web            # 仅启动 Web
mars dev --platform android        # 仅启动 Android
mars dev --platform web --docker   # 在 Docker 中启动 Web（自动 build 镜像后运行）
mars build --platform web          # 仅构建 Web
mars build --platform android      # 仅构建 Android
mars build --platform web --docker # 在 Docker 中构建 Web
mars init                          # 初始化依赖 + 检查环境
mars clean                         # 清理构建产物
```

### Docker 支持

`--docker` 标志会自动完成：
1. 检查 Docker 是否安装
2. 根据平台和命令选择 `docker/<platform>/Dockerfile`（dev）或 `Dockerfile.build`（build）
3. 构建镜像：`docker build -t marsquakes/<platform>:<mode>`
4. 运行容器：`docker run`

目前支持的平台：
| 平台 | dev Dockerfile | build Dockerfile |
|------|---------------|------------------|
| web | `docker/web/Dockerfile` | `docker/web/Dockerfile.build` |

CLI 会自动：
1. 复制/克隆模板到目标目录
2. 替换项目名称（`package.json`、`AGENTS.md`、`platforms.json` 等）
3. 初始化 Git 仓库并提交

### 本地开发测试

在 monorepo 内可直接运行：

```bash
node packages/mars-cli/bin/mars.js create my-project --from .
```

## Monorepo 说明

本项目采用 **pnpm workspace + Turborepo** 管理 npm 生态内的依赖和构建。

### pnpm workspace

- 所有 npm 包统一由 pnpm 管理，根目录 `pnpm install` 一次性安装全部依赖
- `pnpm-workspace.yaml` 定义 workspace 成员：`apps/web`、`packages/*`
- 新增 npm 子项目时，放入 `packages/` 目录或在 `pnpm-workspace.yaml` 中声明

### Turborepo

- 通过 `turbo.json` 定义构建管道（build / dev / lint / clean）
- 支持任务缓存和并行执行，提升构建效率
- 仅作用于 npm workspace 内的包，Android/iOS 等原生平台仍使用各自工具链

### 常用命令

```bash
# 初始化（安装全部依赖 + 检查环境）
pnpm install
npm run init

# 开发（Turborepo 并行启动）
pnpm dev              # 启动所有 dev 任务
pnpm dev --filter=web # 仅启动 Web

# 构建（Turborepo 带缓存）
pnpm build              # 构建全部
pnpm build --filter=web # 仅构建 Web

# 清理
turbo clean           # 清理全部 workspace 构建产物

# Android/iOS 原生命令（不受 Turborepo 管理）
npm run dev:android   # cd apps/android && gradlew installDebug
npm run build:android # cd apps/android && gradlew assembleRelease
```

## 平台配置说明

项目通过 `platforms.json` 定义启用的平台。AI 在初始化或新增平台时，应读取该配置并自动生成对应目录及 AGENTS.md。

```jsonc
// platforms.json 结构示例
{
  "platforms": {
    "mobile": { "android": { "enabled": true, "dir": "apps/android" }, ... },
    "desktop": { "windows": { "enabled": true, "dir": "apps/windows" }, ... },
    "web": { "web": { "enabled": true, "dir": "apps/web" } },
    "api": { "api": { "enabled": true, "dir": "apps/api" } }
  }
}
```

新增平台时：更新 `platforms.json` → 在 `apps/` 下创建对应目录 → 创建 AGENTS.md → 更新本文件的平台表格。

## 平台专属 AGENTS.md

各平台目录下均有独立的 `AGENTS.md`，包含该平台的编码规范、构建命令、注意事项等。AI 在处理特定平台代码时，应参考对应目录下的 AGENTS.md：

| 平台 | AGENTS.md 路径 |
|------|----------------|
| Android | [apps/android/AGENTS.md](apps/android/AGENTS.md) |
| iOS | [apps/ios/AGENTS.md](apps/ios/AGENTS.md) |
| Windows | [apps/windows/AGENTS.md](apps/windows/AGENTS.md) |
| Linux | [apps/linux/AGENTS.md](apps/linux/AGENTS.md) |
| macOS | [apps/macos/AGENTS.md](apps/macos/AGENTS.md) |
| Web | [apps/web/AGENTS.md](apps/web/AGENTS.md) |
| Web Admin | [apps/web-admin/AGENTS.md](apps/web-admin/AGENTS.md) |
| API | [apps/api/AGENTS.md](apps/api/AGENTS.md) |

## 全局编码规范

- **提交信息**: 使用简洁明确的中文或英文描述
- **Git 分支**: 主分支为 `main`，功能分支命名 `feature/xxx`，修复分支 `fix/xxx`
- **忽略文件**: `.idea/`、`.gradle/`、`local.properties`、构建产物、`node_modules`、`.turbo/` 等已加入 `.gitignore`