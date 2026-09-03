---
id: ai-workflow
title: 用 AI 构建项目
sidebar_position: 9
---

# 用 AI 构建项目

一个完整的端到端流程：从空目录到手把手跑起一个管理后台，全程通过提示词驱动。
在此之前请先完成[配置 Agent](./ai-setup.md)。

例子做的是 `admin-platform` —— 后端 API 加管理后台前端，不含别的。这个组合恰好
是 Marsquakes 的默认选择，所以适合作为第一次体验。

## 每一轮都长这样

下面每个阶段都可以套同一个模式，这值得单独拎出来，因为它是"靠谱的 Agent"和
"瞎猜的 Agent"的分水岭：

1. **你说结果，不说命令。**
2. **Agent 执行命令并展示输出。**
3. **你用一条低成本指令验证** —— 看看文件列表、读读配置。

跳过第三步就是一个项目建成时多出五个不该有的端的罪魁祸首。下面每个阶段都在
末尾给了你可以亲手跑一遍的验证。

## 阶段 1 —— 创建项目

> **提示词**
>
> 我想在当前目录下新建一个管理平台，项目名叫 `admin-platform`。只要后端 API
> 和管理后台前端，不要桌面端、移动端和门户站。用 Marsquakes CLI。

Agent 应该执行：

```bash
mars create admin-platform --non-interactive
```

`--non-interactive` 接受默认选择，刚好就是 `web-admin` + `api`。预期输出：

```
✅ Selected 2 modules:
   - Web Admin
   - API Service
```

**验证：**

```bash
ls admin-platform/apps        # api  web-admin
```

未勾选的端根本不会被复制，所以 `apps/` 里出现别的目录就说明选择没生效。

:::tip 其他组合需要交互
`mars create` 没有 `--platform` 参数。要换平台组合，Agent 必须回答交互列表，
按标签旁边的编号切换 —— **绝不能写死数字**。见
[回答选择提示](./ai-agents.md#回答选择提示)。
:::

## 阶段 2 —— 配置环境

> **提示词**
>
> 配好环境变量文件，再装依赖。我在国内网络环境。

```bash
cd admin-platform
cp .env.example.cn .env     # 国内用 .cn，其他网络用 .env.example
pnpm install
```

两个模板的键完全一致，只有 npm 源和 Maven 镜像地址不同。选错不会报错，只会
慢 —— 而 `pnpm install` 卡住时的样子和镜像问题几乎一样，所以值得说出来。

**验证：**

```bash
pnpm check:env              # 两份模板不一致时会报错退出
```

## 阶段 3 —— 启动数据库

> **提示词**
>
> 为本项目启动 MySQL 和 Redis。

```bash
docker compose -f docker-compose.infra.yml up -d
```

**验证：**

```bash
docker compose -f docker-compose.infra.yml ps
```

:::warning 密码必须在第一次启动前设好
MySQL 的 root 密码**只在首次启动时**写入数据卷，之后改 `.env` 不会生效，会得到
`1045 Access denied`。唯一的修复办法是删卷重建。告诉 Agent 在跑这一步之前、
而不是之后，填好真实密码。
:::

## 阶段 4 —— 启动项目

> **提示词**
>
> 把项目跑起来，放到后台运行，然后告诉我访问地址。

```bash
mars dev
```

:::caution `mars dev` 不会返回
它会拉起子进程并常驻前台。Agent 如果把它当阻塞步骤执行，就会一直卡住直到被杀死。
必须放到后台任务里，从捕获的输出中读取地址。
:::

本机没装 JDK？用 Docker 跑就不需要本地工具链：

```bash
mars dev --platform api --docker
```

## 阶段 5 —— 加一个功能

这一步开始，`AGENTS.md` 的价值就体现出来了。

> **提示词**
>
> 在 API 的文章实体上加一个"发布"字段，通过列表接口暴露出来，再在管理后台的
> 表格里加一列。

Agent 应该先读 `apps/api/AGENTS.md` 和 `apps/web-admin/AGENTS.md` 再动手 ——
里面定义了包布局、命名规范、要继承哪些基类。这些约定在提示词里复述一遍既啰嗦
又容易过时，指向文件就好。

**验证：**

```bash
git diff --stat
```

两个习惯值得在提示词里强调：

- **非 trivial 改动先要计划。** 改 400 行的 diff 修起来太贵，但计划错了重来就
  便宜得多。
- **一个逻辑改动一个提交。** 根目录 `AGENTS.md` 要求英文 `<type>(<scope>): <subject>`
  格式，Agent 会照做 —— 只要你在提示词里点了它。

## 阶段 6 —— 写文档

> **提示词**
>
> 把发布字段的设计方案写下来，然后在文档站里加一页介绍这个功能。

两个目的地，Agent 最容易搞混的地方：

| 内容 | 放哪里 |
| ---- | ------ |
| 设计方案、PRD、任务记录、API 接口文档 | `.docs/` —— 内部用，不发布 |
| 面向读者的页面 | `docs/content/`，**并且**要在 `docs/sidebars.ts` 里注册 |

不在 `sidebars.ts` 里的页面，对文档站来说就不存在。这是故意的：发布是一个
明确的决策，不是文件系统里多一个文件就自动成立的。

**验证：**

```bash
pnpm -C docs build
```

文档站配置了 `onBrokenLinks: 'throw'`，内部链接断了会直接报错、不会悄悄发布。
不过锚点检查是另一个开关，默认只警告 —— 如果 Agent 加了 `#fragment` 链接，
要到构建好的 HTML 里确认一下。

## 阶段 7 —— 打包

> **提示词**
>
> 给我打两个端的发布包。

```bash
mars build
```

在干净的检出目录上、没有本地 JDK 或 Node 工具链时，用 Docker 编译：

```bash
docker compose -f docker-compose.build.yml up -d
```

普通的 `docker-compose.yml` 只打包**已经编译好的**制品，缺少就报错。那是 CI
流水线用的，不是第一次跑的路。

## 提示词模板

| 不要这样 | 要这样 |
| -------- | ------ |
| "执行 mars create" | "创建一个只有 API 和管理后台的管理平台" |
| "修一下构建" | "`pnpm -C docs build` 报错了 —— 读一下错误然后修好" |
| "加个表格" | "按 `apps/web-admin/AGENTS.md` 的约定加一个文章列表页" |
| "跑起来" | "用 Docker 启动 API，因为我没装 JDK，然后告诉我健康检查地址" |

模式：说结果，指出约束，指向约定文件。命令名是 Agent 的事。

## 卡住了怎么办

| 现象 | 最可能的原因 |
| ---- | ------------ |
| `pnpm install` 卡住 | 选错了 `.env` 模板 —— 国内网络用 `.env.example.cn` |
| MySQL 报 `1045 Access denied` | 密码改了但数据卷是旧的；删卷重建 |
| `vite build` 每次报在不一样的 `.less` 文件上 | `css.preprocessorMaxWorkers` 没设成 `0` —— 见根目录 `AGENTS.md` |
| JVM 报 "Cannot create worker GC thread" | 基础镜像用了 glibc ≥ 2.34；锁一个 `-focal` / `-bullseye` 标签 |
| Agent 跑完 `mars dev` 后一直卡住 | 当成了阻塞步骤而不是后台任务 |

下一步：[用 AI 做自动化](./ai-automation.md) —— 脚本化、无人值守的用法。