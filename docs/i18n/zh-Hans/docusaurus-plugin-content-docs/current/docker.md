---
id: docker
title: Docker
sidebar_position: 5
---

# Docker

本页描述的所有文件都由 `mars create` 生成到你的项目里 —— 项目根目录的 compose
文件，以及各个 `apps/<platform>/` 内的 Dockerfile。你可以用 `mars dev --docker`
/ `mars build --docker` 驱动它们，也可以直接用 `docker compose`。

先复制环境变量模板。一共两份，区别只在镜像构建时从哪里下载 npm 包与 Maven 依赖：

```bash
cp .env.example .env         # 官方源（默认）
cp .env.example.cn .env      # 国内镜像源
```

复制完再改 `MYSQL_*` / `REDIS_*` / `WEB_ADMIN_PORT`。两份模板声明的键和值完全一致，
只有 `NPM_REGISTRY` 和 `MAVEN_MIRROR_URL` 不同，所以之后想换源，改两行就够，不用重新
复制。改完任意一份之后跑 `pnpm check:env`，两份一旦不一致它会以非零退出码报错。

`.env` 里还有一个 `COMPOSE_PROJECT_NAME`，`mars create` 会把它改写成你的项目名。
它的作用是固定 compose 的项目名，而不是让 compose 默认取小写的目录名——这样换个
目录名检出，就不会悄悄变成另一个项目。它只能放在环境变量里，不能写进 YAML：
compose v2.0.0 会直接拒绝顶层的 `name:` 字段，报
`(root) Additional property name is not allowed`。项目名必须是小写。

## 两个 compose 文件

它们的唯一区别在于镜像是否自己编译源码：

```bash
# 全新检出 / 没有本地工具链：在镜像内部编译
docker compose -f docker-compose.build.yml up -d

# 产物已编译好（jar + dist 存在）：只做打包，几秒完成
docker compose up -d
```

两个文件都是完整且可用单个 `-f` 独立运行的，因此 VS Code 的 Docker 插件可以直接
点击运行任意一个。它们都把 MySQL 与 Redis 当作**外部服务**，通过
`host.docker.internal` 访问。

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

## 基础服务 {#base-services}

`docker-compose.infra.yml` 在本地提供 MySQL 与 Redis，让一次全新检出无需在宿主机
安装数据库就能完整跑起来。它是**用 `-f` 叠加的独立文件**，而不是 `extends` 覆盖：
叠加是在项目层面合并的，因此同一个文件可以与任意一个应用栈组合。

```bash
# 只起基础服务 —— 应用仍从 IDE 里跑，连这两个容器
docker compose -f docker-compose.infra.yml up -d

# 与应用栈一起启动
docker compose -f docker-compose.yml -f docker-compose.infra.yml up -d
docker compose -f docker-compose.build.yml -f docker-compose.infra.yml up -d
```

| 服务    | 镜像                      | 端口                            |
| ------- | ------------------------- | ------------------------------- |
| `mysql` | `marsquakes/mysql:8.0.36` | `${MYSQL_HOST_PORT:-3306}:3306` |
| `redis` | `redis:7-alpine`          | `${REDIS_HOST_PORT:-6379}:6379` |

宿主机端口用的就是标准的 3306 与 6379，现有连接串和 IDE 数据源都不用改。如果宿主机上
本来就跑着自己的 MySQL / Redis，请在 `.env` 里覆盖 `MYSQL_HOST_PORT` /
`REDIS_HOST_PORT`，不要去改 compose 文件。另外别指望端口冲突一定会报错：Linux 上绑定
会直接失败，但 Windows 上的 Docker Desktop 可能照样绑定成功，此时客户端会不声不响地
继续连到宿主机上那个实例，而不是容器。网络内部端口始终是 3306 与 6379。

:::warning
叠加使用时必须在 `.env` 里设置 `MYSQL_HOST=mysql` 与 `REDIS_HOST=redis`。
默认值指向 `host.docker.internal`，不改的话 `api` 会绕开你刚刚启动的容器 ——
这种故障看起来像连接问题，实际上是配置问题。`.env.example` 里已经准备好这段
注释掉的配置，取消注释即可。
:::

MySQL 镜像由 `apps/api/db/Dockerfile` 构建，把 JeecgBoot 的表结构内置到
`/docker-entrypoint-initdb.d`。这些脚本只执行一次，按文件名顺序，且仅在数据目录
为空时执行 —— 想重新导入必须用 `docker compose down -v` 删掉卷。有三个服务端参数
是关键的：`--lower_case_table_names=1`（Linux 区分大小写，而 mapper 假设不区分）、
`--max_allowed_packet=128M`（默认 4M 会让约一万行的 dump 中途失败）以及
`--character-set-server=utf8mb4`。

:::caution
基础镜像固定的是 **补丁版本** `mysql:8.0.36`，不是浮动的 `mysql:8.0`，请不要"顺手"改回去。
`mysql` 官方镜像基于 Oracle Linux，而 OL 9 的 glibc 是 2.34，会触发 AGENTS.md 里记录的
`clone3` seccomp 限制：在 Docker 20.10.8 上，`mysql:8.0`（当前 8.0.46 / OL 9.7）会在
`--initialize` 阶段就以 `Can't create thread to handle bootstrap (errno: 1)` 失败，
之后无限重启并抱怨数据目录非空，把真正的首个错误埋在日志深处。`8.0.36`（OL 8.9 / glibc 2.28）
实测正常。升级这个固定版本前先确认新标签的 glibc：
`docker run --rm --entrypoint sh mysql:<tag> -c "ldd --version | head -1"`。

表结构文件名里的 `5.7` 指的是 Navicat 导出时的 **源库** 版本，不是运行要求：dump 中所有
标识符都用反引号包裹（8.0 新增的 `rank` / `groups` / `over` 等保留字不会出问题），也没有
`NO_AUTO_CREATE_USER`、`GRANT ... IDENTIFIED BY`、零日期或 MyISAM。MySQL 5.7 已于
2023 年 10 月停止维护，不要为了迁就文件名去降级服务端。
:::

`api` 无法对另一个文件里的服务声明 `depends_on`，因此它会在表结构导入完成前就启动
并退出；`restart: on-failure` 会不断把它拉起来直到数据库可用。首次 `up` 时出现几次
重启属于预期行为。

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
`node:22-bullseye-slim`、`nginx:stable`，以及任意 `alpine` 标签。
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
