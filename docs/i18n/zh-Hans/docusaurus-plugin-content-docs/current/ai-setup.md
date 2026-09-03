---
id: ai-setup
title: 配置 Agent
sidebar_position: 8
---

# 配置 Agent —— DeepSeek Harness

[配合 AI Agent 使用](./ai-agents.md)讲的是**为什么**用 shell 而不是 MCP server
驱动 Marsquakes。本页负责把那个"驱动者"装起来。

:::note 中英文各用一套工具
中文文档使用 **DeepSeek Harness（命令 `dsh`）**，英文文档使用
**OpenAI Codex CLI**。两条线不是互译关系，你实际用哪个就看哪个。再往后的内容
（`mars`、`AGENTS.md`、各种校验命令）两边完全一致 —— 因为 Agent 自始至终都只
通过 shell 和 Marsquakes 打交道。
:::

:::warning 开发者预览版
DeepSeek Harness 目前处于 developer preview，命令和配置随时可能发生破坏性变更。
遇到和本文不符的行为，以 `dsh --help` 和
[官方仓库](https://github.com/deepseek-ai/deepseek-harness)（默认分支是
`master`，不是 `main`）为准。
:::

## 先确认 Node 版本

这是最容易踩的一个坑。dsh 的 `engines` 声明是
**`^22.19.0 || >=24.0.0`** —— Node 20 装不上，而 Node 20 恰恰是很多人手头的
长期支持版本。

```bash
node -v
```

版本不够就先升级，或者用版本管理器切一个：

```bash
nvm use 22
```

:::caution 文档站自己要 Node ≥ 20
Marsquakes 文档站的要求是 Node ≥ 20，dsh 要求 ≥ 22.19。取交集，直接用 22 或 24
就都满足了。
:::

## 安装

试用一次，不落盘：

```bash
npx @deepseek-ai/dsh web
```

长期使用建议全局安装：

```bash
npm install -g @deepseek-ai/dsh
dsh --version
```

dsh 的插件管理会调用 **pnpm**，所以 pnpm 必须在 PATH 上。Marsquakes 本身也只
支持 pnpm，这一条通常已经满足了。

从源码跑（想改插件时用）：

```bash
git clone https://github.com/deepseek-ai/deepseek-harness
cd deepseek-harness
pnpm install
pnpm run build
pnpm dsh web
```

## 配置 API Key

Web UI 和命令行读的是两个地方，这一点必须分清楚，否则会出现"网页里能用、
脚本里报没有 key"的情况。

**Web UI：** 打开后进 Settings → Models 填入即可，它自己会持久化。

**命令行 / headless：** 写在 `$DSH_HOME/.credentials.yaml`，`$DSH_HOME` 默认是
`~/.dsh`：

```yaml
# ~/.dsh/.credentials.yaml
DEEPSEEK_API_KEY: sk-xxxxxxxxxxxxxxxx
```

macOS / Linux 上必须收紧权限，dsh 会拒绝加载所有人可读的凭据文件：

```bash
chmod 600 ~/.dsh/.credentials.yaml
```

也可以走环境变量，**优先级高于文件**，适合 CI：

```bash
export DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxx
```

## 启动方式

`dsh` 通过 profile 区分运行形态：

| 命令 | 用途 |
| ---- | ---- |
| `dsh web` | 启动 Web UI，等价于 `--profile web` |
| `dsh --profile headless "任务"` | 跑完一次性任务、打印结果、退出 |
| `dsh --profile acp` | 以 ACP stdio 协议对接自动化客户端 |
| `dsh --profile sdk` | 以 JSON-RPC stdio 对接 SDK 客户端 |
| `dsh --profile sdk-minimal` | 独立的最小 Agent 树 |
| `dsh plugin --profile <名字> <pnpm 参数>` | 管理某个 profile 的插件，参数透传给 pnpm |

日常开发用 `dsh web`：

```bash
dsh web
```

默认监听 `http://127.0.0.1:3080` 并自动打开浏览器。端口冲突就换一个：

```bash
dsh web --port 8080
```

不想让它抢焦点：

```bash
dsh web --no-open
```

想在不启动的前提下看看插件树被组装成了什么样：

```bash
dsh --dump-config
dsh --dump-default-config
```

`web`、`headless`、`sdk`、`sdk-minimal`、`acp` 这几个 profile 会自动初始化，
其他名字得先用 `dsh plugin` 创建。

## 从哪个目录启动

**`dsh` 把启动时所在的目录当作工作区根目录。** 这条比看起来重要：

```bash
cd ~/projects          # 要新建项目，就站在新项目的「父目录」
dsh web
```

```bash
cd ~/projects/admin-platform    # 维护已有项目，站在项目里
dsh web
```

站错目录的典型症状是：Agent 声称创建成功，但你在预期位置找不到那个目录 ——
它建在别处了。

## 为什么 `AGENTS.md` 在这里很关键

Marsquakes 在根目录和每个平台目录下都放了 `AGENTS.md`，这正是"不需要额外集成"
的全部原因：

| 文件 | 管辖范围 |
| ---- | -------- |
| `AGENTS.md`（根目录） | 目录规则、Docker 布局、基础镜像约束、提交格式 |
| `apps/api/AGENTS.md` | 后端约定 |
| `apps/web-admin/AGENTS.md` | 管理后台前端约定 |
| `docs/AGENTS.md` | 文档站 |

生成出来的项目会继承这些文件。如果你用的 Agent 不会自动读取它们，在提示词里
点名即可 —— 指向文件永远比在提示词里复述规则可靠，因为文件不会和仓库脱节。

## 验证一下

先要一件只读的事情。这一步能过，说明 shell、凭据、工作区目录都是对的：

> **提示词**
>
> 执行 `mars --version`，然后告诉我 `platforms.json` 里启用了哪些平台。

接下来看[用 AI 构建项目](./ai-workflow.md)。
