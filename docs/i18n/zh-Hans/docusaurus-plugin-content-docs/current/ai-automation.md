---
id: ai-automation
title: 用 AI 做自动化
sidebar_position: 10
---

# 用 AI 做自动化

[用 AI 构建项目](./ai-workflow.md)里的一切都默认你在旁边看着。本页讲另一种
模式：无人值守，跑在脚本或 CI 里，下游靠退出码判断成败。

## headless 模式

一次性任务的入口。跑完一个全新的持久化会话，打印结果，然后退出：

```bash
dsh --profile headless "读取 platforms.json，把启用的平台每行一个列出来"
```

先看看它支持什么：

```bash
dsh --profile headless --help
```

`--help` 只打印帮助、不会执行任何任务。

## 输入输出约定

这是 headless 能被脚本消费的关键，务必分清三条流：

| 通道 | 内容 |
| ---- | ---- |
| stdout | 最终答案 |
| stderr | 推理过程增量，挂在 `dsh: reasoning:` 标题下 |
| stderr | 失败信息，格式为 `dsh: <code>: <message>` |

所以想只拿结果，把 stderr 丢掉就行：

```bash
result=$(dsh --profile headless "列出 apps 下的所有目录" 2>/dev/null)
```

想留下推理过程排查问题，就分开重定向：

```bash
dsh --profile headless "任务" >answer.txt 2>trace.log
```

:::tip 别把推理过程当结果解析
推理增量走的是 stderr，混进 stdout 只会让下游解析到一堆中间思考。这个分流是
设计出来给自动化用的，不要用 `2>&1` 把它合并掉。
:::

## 退出码

| 来源 | 约定 |
| ---- | ---- |
| `dsh --profile headless` | `0` 完成；`1` 中止或出错 |
| 任务为空 | 属于用法错误，退出码 `1` |
| `mars` | `0` 成功，`1` 任何失败 —— 参数写错和工具链缺失无法区分 |
| `pnpm -C docs build` | 内部链接断掉时非零（`onBrokenLinks: 'throw'`） |
| `pnpm check:env` | 两份 `.env` 模板漂移时非零 |

`mars` 的退出码粒度粗是主要限制。需要区分原因的封装脚本只能自己解析输出，
或者主动探测环境。

## 脚本化创建项目

创建这一步能干净地自动化，因为默认平台组合不需要交互：

```bash
#!/usr/bin/env bash
set -euo pipefail

mars create admin-platform --non-interactive
cd admin-platform
cp .env.example .env
pnpm install
```

默认组合以外的搭配**没法干净地自动化**。`mars create` 没有 `--platform` 参数，
换组合就必须回答编号列表，而编号会随着 `platforms.json` 新增平台而偏移。往里
管道喂一个写死的 `6`，等于给下个版本埋了个雷。

## 把结果读回来

CLI 是给人看的，自动化调用方应该从文件读状态，而不是解析文字：

```bash
node -e "const p=require('./platforms.json').platforms;for(const c in p)for(const k in p[c])if(p[c][k].enabled)console.log(k)"
# web-admin
# api
```

```bash
ls apps
```

这两条在 CLI 输出改版时依然成立，文字解析则不然。

## 在 CI 里

两条规则占了大部分分量。

**CI 里绝不要跑 `mars dev`。** 它不会返回。用 `mars build`，或者 Docker compose
文件。

**选对 compose 文件：**

```bash
# 干净检出、本机没有 JDK / Node 工具链 —— 在镜像里编译
docker compose -f docker-compose.build.yml up -d
```

```bash
# 制品已由前置流水线阶段编译好 —— 只做打包
docker compose up -d
```

普通那份故意不带编译阶段：它几秒就能构建完，缺制品时会大声失败，而不是偷偷
重编一遍、把上游断掉的步骤藏起来。

CI 里的凭据走环境变量，优先级高于 `~/.dsh/.credentials.yaml`：

```bash
export DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxx
```

## 让 Agent 待在轨道里

无人值守时没人能在它拐错弯的瞬间叫停，所以要在启动前就把任务收窄：

- **限定目录。** 先 `cd` 到目标平台目录再启动 —— `dsh` 用启动目录作为工作区
  根目录，这本身就是一道边界。
- **一次只要一件事。** "更新 changelog"是可校验的，"整理一下项目"不是。
- **指向约定文件。** 提示词里写 `apps/api/AGENTS.md`，胜过复述一整段规则，
  而且它不会和仓库脱节。
- **校验单独成步。** 把 `pnpm -C docs build`、`git diff --stat` 作为独立步骤跑，
  失败才会归因到检查本身，而不是埋在 Agent 的输出里。
- **不要自动提交**，除非那就是这次任务本身。留着脏工作区，让人来读 diff。

## 哪些步骤故意不自动化

| 步骤 | 为什么保持手动 |
| ---- | -------------- |
| 非默认的平台选择 | 编号列表，序号会随版本偏移 |
| 数据库首次启动 | 密码只写入卷一次，之后不再读取 |
| 发布文档页面 | `docs/sidebars.ts` 注册本身就该是一个明确决策 |
| 发版时的 `git commit` | 提交粒度是人的判断 |
