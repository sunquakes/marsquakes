---
id: docker
title: Docker
sidebar_position: 5
---

# Docker

本页描述的所有文件都由 `mars create` 生成到你的项目里 —— 项目根目录的 compose
文件，以及各个 `apps/<platform>/` 内的 Dockerfile。你可以用 `mars dev --docker`
/ `mars build --docker` 驱动它们，也可以直接用 `docker compose`。

先复制环境变量模板 —— MySQL 与 Redis 是 **外部服务**，不在编排栈内：

```bash
cp .env.example .env         # 然后修改 MYSQL_* / REDIS_* / WEB_ADMIN_PORT
```

## 两个 compose 文件

它们的唯一区别在于镜像是否自己编译源码：

```bash
# 全新检出 / 没有本地工具链：在镜像内部编译
docker compose -f docker-compose.build.yml up -d

# 产物已编译好（jar + dist 存在）：只做打包，几秒完成
docker compose up -d
```

两个文件都是完整且可用单个 `-f` 独立运行的，因此 VS Code 的 Docker 插件可以直接
点击运行任意一个。

| 服务        | 镜像                         | 端口                         |
| ----------- | ---------------------------- | ---------------------------- |
| `api`       | `marsquakes/api:3.9.3`       | `8080:8080`                  |
| `web-admin` | `marsquakes/web-admin:3.9.3` | `${WEB_ADMIN_PORT:-8807}:80` |

`docker-compose.build.yml` 通过服务级的 `extends` 继承 `docker-compose.yml`，
只覆盖 `build.dockerfile` 一项。

:::warning
`extends` 继承的是**服务**而不是项目 —— 顶层 `networks:` **不会**被继承。
被继承服务引用的每个网络都必须在覆盖文件中重新声明，否则 compose 会直接报
`service "api" refers to undefined network <net>`。而 `depends_on` 与
`container_name` **会**被继承，不要重复声明。
:::

## Dockerfile 变体

Dockerfile 与它所构建的代码放在一起，位于各平台目录内。变体名称按
**镜像是否编译源码** 命名，而不是按 CLI 动词命名。

| 文件                          | 是否编译源码 | 用途                                 |
| ----------------------------- | ------------ | ------------------------------------ |
| `<platform>/Dockerfile`       | 否           | 打包已构建产物；产物不存在则直接失败 |
| `<platform>/Dockerfile.build` | 是           | 自包含的多阶段构建                   |
| `<platform>/Dockerfile.dev`   | 否           | 开发镜像，挂载源码、支持热更新       |

[`mars` CLI](./cli.md) 的 `--docker` 参数会从 `platforms.json` 解析平台目录，
按模式挑选变体（`dev` → `Dockerfile.dev`，`build` → `Dockerfile.build`，
各自在缺失时回退到裸 `Dockerfile`），然后构建并运行容器。

## 构建上下文

构建上下文**始终是仓库根目录**，因此所有 `COPY` 都使用相对仓库根的路径
（例如 `COPY apps/api/pom.xml ./`）。正因如此，Dockerfile 才能访问
`pnpm-workspace.yaml`、`turbo.json` 与 `packages/*` 这类 workspace 级文件。

根目录的 `.dockerignore` 决定发送给 daemon 的内容。它排除了 `**/target` 与
`**/dist`，所以裸 `Dockerfile` 需要用到的任何产物路径，都必须用 `!` 规则
显式重新包含，且该规则必须放在这些排除项**之后**。

## 基础镜像约束

有两条约束是关键性的，都已在真实机器上复现过 —— 请不要“顺手清理”掉。

### 1. 把镜像标签锁定在 glibc 2.31（`-focal` / `-bullseye`）

Docker 20.10.8 的默认 seccomp 配置没有放行 `clone3` 系统调用。基于
glibc >= 2.34 构建的镜像（`jammy`、`trixie` —— 也就是 node 的*默认*标签 ——
以及 `amazoncorretto`）创建线程时会以 `EPERM` 失败。JVM 会把它误报为
`insufficient memory ... Cannot create worker GC thread`，让你去排查一个
根本不存在的内存问题。

已验证可用：`maven:3.9-eclipse-temurin-17-focal`、`eclipse-temurin:17-jre-focal`、
`node:20-bullseye-slim`、`nginx:stable`，以及任意 `alpine` 标签。
`--security-opt seccomp=unconfined` 也能绕过；升级 Docker 到 23+ 可彻底消除该约束。

### 2. `apps/web-admin` 必须保留 `css.preprocessorMaxWorkers: 0`

Vite 7 的 `preprocessorMaxWorkers` 默认为 `true`，会启动
`availableParallelism() - 1` 个 less worker 线程。每个 worker 的 `waitUnlock()`
使用 `Atomics.wait(..., 5000)`，其超时时间是**硬编码的 5 秒**，一旦超时就抛出
`Error("timed-out")`。在容器里主线程的卡顿足以触发它，于是 `vite build`
**每次都在不同的 `.less` 文件上失败** —— 这让它看起来像源码 bug 而不是超时。
设为 `0` 则在主进程内执行 less：更慢，但结果确定。

:::tip
`vite-plugin-pwa` 的 `buildEnd` 钩子会吞掉真正的错误信息，只在构建日志里留下一个
空错误。想看到真实原因，可以构建一个停在 build 步骤之前的镜像，进去手动执行
`pnpm exec vite build --mode docker`。
:::

## 代理

直连时 `docker.io` 可能被 DNS 污染，此时 Docker daemon 需要配置 HTTP/HTTPS 代理
（Docker Desktop → Settings → Resources → Proxies）。配好代理后所有官方镜像都能
正常拉取 —— 不要替换成第三方镜像源。
