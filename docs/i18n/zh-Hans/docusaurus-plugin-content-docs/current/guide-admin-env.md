---
id: guide-admin-env
title: 环境准备
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 后台管理系统：环境准备

后台管理系统是**配套的一对**：`apps/web-admin` 里的 Vue 3 + Vite 网站（纯
Node/pnpm 应用），和 `apps/api` 里的 Spring Boot 后端（多模块 Maven 项目，
**不是** pnpm 工作区成员），后端对接跑在容器里的 MySQL 和 Redis。两半的成熟度
均为：**可运行**。

两个端都选中时，下面这些除了 Docker 之外都由 `mars init` 安装 —— Docker 它只
**报告**（系统守护进程，不是语言工具链）。下面是你没有运行 `mars init`、或它
报告了无法安装的内容时的手动步骤。

## 前置条件

| 工具 | 最低版本 | 用途 |
| ---- | -------- | ---- |
| Node.js | 22.12.0 | web-admin 开发服务器和构建 |
| pnpm | 9.0.0 | workspace 依赖和脚本 |
| Docker | ≥ 20.10.0 与 Compose ≥ 2.0.0 | MySQL 和 Redis —— 始终必需 |
| JDK | 17（Temurin） | 在宿主机上运行或构建 API |
| Maven | 3.9.0 | 在宿主机上运行或构建 API |

JDK 和 Maven 两行**仅宿主机运行需要**：如果 API 放在容器里运行，宿主机两者都
不需要（`mars init --docker` 会跳过它们）。

## 第 1 步 —— 检查 Node 和 pnpm

在仓库根目录执行：

```bash
node -v
pnpm --version
```

如果缺少任一项或版本过低，按[环境准备](./install.md)操作（Node 用 mise，
pnpm 用 Corepack）。

## 第 2 步 —— 安装 Docker {#docker}

Docker 始终是必需的，因为 MySQL 和 Redis 跑在容器里。按你的操作系统安装：

<Tabs groupId="os">
<TabItem value="windows" label="Windows (PowerShell)">

```powershell
winget install --id Docker.DockerDesktop -e
```

</TabItem>
<TabItem value="unix" label="macOS / Linux">

在 macOS 上用 Homebrew：

```bash
brew install --cask docker
```

在 Linux 上用官方便捷脚本（或按 docs.docker.com 添加 Docker 官方 apt 源 ——
发行版仓库里的 `docker.io` 包太旧）：

```bash
curl -fsSL https://get.docker.com | sh
```

</TabItem>
</Tabs>

然后按顺序完成：

1. **启动守护进程。** 启动 Docker Desktop（Windows、macOS）或启动服务（Linux）。
   在它运行之前，`docker --version` 能成功，但所有真正的命令都会失败。
2. **仅 Linux —— 加入 `docker` 用户组，然后完全注销重新登录**（只开新终端不够，
   因为用户组成员身份在登录时确定）：

   ```bash
   sudo usermod -aG docker "$USER"
   ```

3. **确认守护进程真的应答**，而不只是客户端存在：

   ```bash
   docker info
   ```

需要 Docker ≥ 20.10.0 与 Compose ≥ 2.0.0。如果 `docker.io` 解析异常，应在 Docker
Desktop → Settings → Resources → Proxies 里配置 HTTP/HTTPS 代理，而不是换成
第三方镜像加速器；原因见 [Docker](./docker.md) 页面。

### JDK 17 与 Maven 3.9.0（仅宿主机运行需要） {#jdk-and-maven}

如果 API 只在容器里运行，整节都可跳过。装好 mise 之后（见
[环境准备](./install.md)），一步固定这两个版本 —— 这正是 `mars init` 执行的
那两行：

```bash
mise use --global java@temurin-17
mise use --global maven@3.9
```

之后打开一个新终端 —— mise 的 shell 钩子负责把工具放上 `PATH` 并设置
`JAVA_HOME`（可用 `mise doctor` 检查）。`temurin-17` 的厂商前缀是刻意为之
（裸写 `java@17` 会解析到不再持续收到安全补丁的构建）；`maven@3.9` 是必需的，
因为 Apache 的 CDN 只保留当前发布版。

如果这台机器不能运行 mise（受管控的公司镜像，或 JDK 由另一个团队管理），就改
用系统包 —— 不要把两条路径混用，否则构建会绑定到 `PATH` 上靠前的那个 JDK：

| 系统 / 包管理器 | JDK 17 | Maven |
| --------------- | ------ | ----- |
| Windows / winget | `winget install --id EclipseAdoptium.Temurin.17.JDK -e` | `winget install --id Apache.Maven -e` |
| macOS / brew | `brew install --cask temurin@17` | `brew install maven` |
| Linux / apt | `apt-get install -y openjdk-17-jdk` | `apt-get install -y maven` |
| Linux / dnf、yum | `dnf install -y java-17-openjdk-devel` | `dnf install -y maven` |
| Linux / pacman | `pacman -S --noconfirm jdk17-openjdk` | `pacman -S --noconfirm maven` |

要装 **JDK** 而不是 JRE（JRE 不能编译；Linux 上 `-jdk` / `-devel` 后缀就是这个
含义）。JDK 21 也可以，JDK 11 不行。winget 的 Temurin 包会自行设置
`JAVA_HOME`，其他大多数安装器则不会。

## 第 3 步 —— 启动 MySQL 和 Redis {#start-the-dependencies}

即使 API 本身跑在宿主机上，数据库也跑在容器里：

```bash
docker compose -f docker-compose.infra.yml up -d
```

这会在宿主机 `${MYSQL_HOST_PORT:-3306}` 端口启动 MySQL、在
`${REDIS_HOST_PORT:-6379}` 端口启动 Redis。连接信息、密码和端口覆盖都在 `.env`
里，完整的服务表见 [Docker](./docker.md#base-services)。

:::note
如果提示找不到 `docker`、或命令无法连接守护进程，先安装并启动 Docker ——
见上方[第 2 步](#docker)。
:::

## 下一步

容器已经启动、并且 —— 宿主机运行时 —— JDK 和 Maven 也已装好，继续看
[如何开发](./guide-admin-develop.md)。
