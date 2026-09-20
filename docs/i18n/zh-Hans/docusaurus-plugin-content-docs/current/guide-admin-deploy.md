---
id: guide-admin-deploy
title: 部署
---

# 后台管理系统：部署

两半的打包方式各不相同：Web Admin 是 nginx 提供的静态构建产物，API 是跑在 JRE
容器里的 Spring Boot jar。按顺序执行下面的步骤。

## 第 1 步 —— 构建 Web Admin

```bash
pnpm build --filter=web-admin
# 或快捷方式
pnpm build:web-admin
```

`mars build --platform web-admin` 执行的是同一个 workspace 构建。

### 在容器里提供服务

要改为在容器内构建并提供服务、而不是在宿主机上：

```bash
mars build --platform web-admin --docker
```

容器在 `${WEB_ADMIN_PORT:-8807}` 端口（默认 8807，映射到容器内 nginx 的 80 端口）
提供应用，这与开发服务器的 3100 刻意不同。Dockerfile 变体和网络慢时要紧的
`NPM_REGISTRY` 构建参数见 [Docker](./docker.md)。

## 第 2 步 —— 在容器里构建并运行 API

CLI 会从源码构建镜像并运行：

```bash
mars build --platform api --docker
```

等价的 compose 调用在镜像内部编译，宿主机不需要 JDK 或 Maven：

```bash
docker compose -f docker-compose.build.yml up -d
```

两者都发布 `8080:8080` 端口，并且都要求 MySQL 和 Redis 已经在运行 —— 用
`docker compose -f docker-compose.infra.yml up -d` 启动（见
[环境准备](./guide-admin-env.md#start-the-dependencies)）。[Docker](./docker.md)
页面介绍了 Dockerfile 变体、`.env` 构建参数（`MAVEN_MIRROR_URL`）以及在网络慢或
Docker 守护进程较旧时要紧的基础镜像锁定。

## 下一步

workspace 级别的 `mars dev`、`mars build` 和 `mars clean` 见
[开始一个项目](./create-project.md#运行和构建项目)。完整的容器工作流见
[Docker](./docker.md) 参考。
