---
id: ai-agents
title: 配合 AI Agent 使用
sidebar_position: 7
---

# 让 AI Agent 使用 Marsquakes

不需要额外起服务，AI 编程助手就能把 Marsquakes 当作工具使用。它只需要三样东西，
而这三样都已经具备：一个 shell、`mars` 可执行命令，以及描述项目约定的
`AGENTS.md`。

:::info 为什么不做 MCP server
MCP server 意味着每条命令都要有第二套实现，而且它的工具定义会被注入**每一次**
会话——哪怕你这次根本不创建项目。`mars dev` 还是常驻进程，并不适配请求/响应式
协议。相比之下，shell + `AGENTS.md` 在不使用时零成本，也永远不会和 CLI 脱节，
所以这才是推荐路径。
:::

## 提示词示例：「我想新建一个管理平台」

这是最典型的例子。用户只描述目标，命令由 Agent 自己选。

> **提示词**
>
> 我想新建一个管理平台，项目名叫 `admin-platform`。只要后端 API 和管理后台
> 前端，不要桌面端、移动端和门户站。帮我初始化好并能跑起来。

### Agent 应该怎么做

**1. 创建项目。**

`api` + `web-admin` 正好就是默认选择，所以这个需求根本不用折腾平台勾选：

```bash
mars create admin-platform --non-interactive
```

`--non-interactive` 表示直接采用默认选择、跳过交互。如果 Agent 执行的是
`mars create admin-platform`，那么喂一个空行同样能得到相同结果 ——
见下方[回答选择提示](#回答选择提示)。

```
✅ Selected 2 modules:
   - Web Admin
   - API Service
```

**2. 配置并启动。**

```bash
cd admin-platform
cp .env.example .env        # 国内网络用 .env.example.cn
pnpm install
mars dev
```

### 如何确认成功

两个校验，成本都很低：

```bash
ls apps                     # api  web-admin
```

```bash
node -e "const p=require('./platforms.json').platforms;for(const c in p)for(const k in p[c])if(p[c][k].enabled)console.log(k)"
# web-admin
# api
```

未勾选的端根本不会被复制，所以 `apps/` 里出现别的目录就说明选择没生效。

`mars create` 还会执行 `git init` 并提交一条 `init: create project from
template`，因此项目一创建出来就是一个干净的仓库。

## 回答选择提示

默认组合以外的任何搭配都必须走交互 —— `create` 没有 `--platform` 参数。Agent
用管道喂输入时没有 TTY，CLI 会退化成编号列表：

```
  🖥️ Desktop:
   3. [ ] Windows [developing]
   4. [ ] Linux [developing]
   5. [ ] macOS [developing]
   6. [ ] Desktop
         Tauri (Win / macOS / Linux)

  🌐 Web:
   7. [ ] Web Client [developing]
   8. [✓] Web Admin
         Backend administration system

  ⚙️ API:
   9. [✓] API Service
         RESTful API service

  Please enter selection (space-separated numbers):
```

| 输入 | 效果 |
| ---- | ---- |
| 空行 | 接受已勾选的默认值 —— `web-admin` + `api` |
| `6` | **切换**第 6 项，即加上 `Desktop`，变成三个模块 |
| `a` | 选中所有可选平台 |
| `n` | 全不选 |

:::caution 认标签，不要认数字
编号是按 `platforms.json` 里的分类顺序累加出来的，一旦新增平台就会偏移。Agent
必须读取打印出来的列表、找到目标标签旁边的那个数字，**绝不能把 `6` 写死**。
标着 `[developing]` 的条目即使被切换也会被静默忽略。
:::

## 什么时候可以非交互

只有在默认组合恰好就是你想要的时候，`--non-interactive` 才合适：

| 目标 | 命令 |
| ---- | ---- |
| 默认两端（`web-admin` + `api`） | `mars create my-app --non-interactive` |
| 其他任意组合 | 走交互，按编号切换 |

## 更多提示词示例

| 提示词 | Agent 应执行的命令 |
| ------ | ------------------ |
| 「只启动管理后台前端」 | `mars dev --platform web-admin` |
| 「跑一下 API，我本机没装 JDK」 | `mars dev --platform api --docker` |
| 「打个发布包」 | `mars build` |
| 「把这个项目同步到最新模板」 | `mars update` |
| 「检查工具链并装依赖」 | `mars init` |
| 「把 MySQL 和 Redis 起起来」 | `docker compose -f docker-compose.infra.yml up -d` |
| 「在干净检出上构建镜像」 | `docker compose -f docker-compose.build.yml up -d` |

## Agent 应该先读什么

约定就近存放在它所管辖的代码旁边，所以 Agent 应该读取离改动点最近的那份
`AGENTS.md`：

| 文件 | 管辖范围 |
| ---- | -------- |
| `AGENTS.md`（根目录） | 目录规则、Docker 布局、基础镜像约束、提交格式 |
| `apps/api/AGENTS.md` | 后端约定 |
| `apps/web-admin/AGENTS.md` | 管理后台前端约定 |
| `docs/AGENTS.md` | 文档站 |

根目录那份里有两条特别值得重复，因为它们是 Agent 最常搞错的：

- 设计文档、PRD、任务记录放 `.docs/`；对外发布的页面放 `docs/content/`，并且
  **必须**在 `docs/sidebars.ts` 里注册。
- 提交信息使用英文，格式为 `<type>(<scope>): <subject>`。

## 已知的粗糙之处

这个 CLI 首先是给人用的。接入自动化时要有心理预期：

- **只有人类可读的输出。** 没有 `--json`，结果要么从文字里解析，要么按上面的
  办法从 `platforms.json` 和 `apps/` 反推。
- **退出码粒度粗。** 所有失败都是 `1`，调用方无法区分参数写错和工具链缺失。
- **`mars dev` 不会返回。** 它会拉起子进程并常驻前台，只能放到后台任务里跑，
  绝不能当成阻塞步骤。

## 下一步

[配置 Agent](./ai-setup.md) —— 安装并配置 DeepSeek Harness，然后走一遍
[用 AI 构建项目](./ai-workflow.md)。
