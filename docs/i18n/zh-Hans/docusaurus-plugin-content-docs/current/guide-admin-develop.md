---
id: guide-admin-develop
title: 如何开发
---

# 后台管理系统：如何开发

两半分开运行：Vite 在 **3100** 端口提供带热更新的前端，并把 API 调用代理到
**8080** 端口的后端。按顺序执行下面的步骤。

## 第 1 步 —— 启动依赖

MySQL 和 Redis 必须先跑起来。按
[环境准备 → 启动依赖](./guide-admin-env.md#start-the-dependencies) 启动它们。

## 第 2 步 —— 运行 Web Admin

在仓库根目录执行，下面两条任选其一（第二条是根目录的快捷脚本）：

```bash
pnpm dev --filter=web-admin
pnpm dev:web-admin
```

Vite 开发服务器监听 **3100** 端口（由 `apps/web-admin/.env` 中的 `VITE_PORT`
设定），打开 `http://localhost:3100`。CLI 只是对同一条命令的封装：

```bash
mars dev --platform web-admin
```

## 第 3 步 —— 在宿主机上运行 API

宿主机运行需要先按
[环境准备 → JDK 17 与 Maven 3.9.0](./guide-admin-env.md#jdk-and-maven) 装好 JDK 和
Maven；启用 `api` 时 `mars init` 会安装它们（除非你传了 `--docker`）。在仓库根
目录执行：

```bash
cd apps/api && mvn -pl jeecg-module-system/jeecg-system-start -am spring-boot:run
```

`-pl` 选中启动模块，`-am` 构建它依赖的模块。服务监听 `http://localhost:8080`，
Web Admin 的开发服务器会把 API 调用代理到这里。把它放在你自己掌控的终端里
（`mars dev` 刻意没有封装它），方便查看日志、用 `Ctrl+C` 停止。

## 第 4 步 ——（可选）在容器里运行 API

没有宿主机 JDK 或 Maven 时，可以改为在容器里运行后端——既可以打包已构建好的
jar，也可以在镜像内部从源码编译：

```bash
# 打包一个已经构建好的 jar（快）；产物不存在时会失败
docker compose up -d

# 在镜像内部从源码编译 —— 宿主机不需要 JDK/Maven
docker compose -f docker-compose.build.yml up -d
```

两者都发布 `8080:8080` 端口。构建并运行这条路径的 CLI 等价命令是
`mars build --platform api --docker`，在[部署](./guide-admin-deploy.md)一节介绍。
Dockerfile 变体、`.env` 构建参数（`MAVEN_MIRROR_URL`）以及网络慢或 Docker 守护
进程较旧时要紧的基础镜像锁定，见 [Docker](./docker.md)。

## 第 5 步 —— 了解项目结构

前端源码位于 `apps/web-admin/src/`：`api/` 放请求，`views/` 放页面，另有
`components/`、`store/`、`router/`、`layouts/` 和 `hooks/`；构建配置在 `build/`，
mock 数据在 `mock/`。改前端代码前先读 `apps/web-admin/AGENTS.md`。后端则先读
`apps/api/AGENTS.md`：它是多模块 Maven 项目，结构和初始数据位于 `apps/api/db/`
—— 那份导出虽然名字里写着 5.7，却能干净地导入 MySQL 8，原因见
[Docker](./docker.md)。

## 第 6 步 —— 让 AI Agent 替你开发功能

在仓库根目录运行的 AI 编程助手可以替你加功能；你用大白话指挥它，在浏览器里检查
结果。完整的对话过程，包括看到异常时该说什么，在 AI 那条线上：
[后台管理系统：创建功能](./ai-admin-module.md)。简版如下：

1. 先确认本页讲的两个半端都在运行。
2. 粘贴下面的提示词，然后**等方案出来**，批准之前什么都别动。
3. 完成后按它的建议重启，刷新 `http://localhost:3100`，亲手把每个按钮都点一遍。

```text
我想要一个新功能来管理文章。动任何东西之前，先读 `apps/api/AGENTS.md` 和
`apps/web-admin/AGENTS.md`，然后把方案给我看，等我批准。

每篇文章包含这些信息：

- 标题——文本，必填
- 作者——文本
- 摘要——几行文字
- 是否发布——一个是/否开关，默认为否
- 发布日期——一个日期

我需要常用的管理功能：带搜索的分页列表、新增、编辑、删除、批量删除，以及 Excel
导入和导出。还要带上标准的记录字段（谁在什么时候创建、谁在什么时候最后修改）。按
项目的标准做法、照着现有功能的样子来做；把菜单登记好，让我重新登录后能看到；做完
列出你改过的每一个文件。
```

一个完整功能横跨**两个半端**——`apps/api/` 下的数据与服务层，加上
`apps/web-admin/` 下的页面和请求——还要把菜单作为数据登记；改动清单只落在一个
半端就让它回去补。先要方案，一次只做一个功能，这样改动才能单独撤销。

## 下一步

两半都按预期运行之后，继续看[部署](./guide-admin-deploy.md)。
