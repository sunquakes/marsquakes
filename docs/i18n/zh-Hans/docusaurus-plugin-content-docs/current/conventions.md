---
id: conventions
title: 规范
sidebar_position: 6
---

# 规范

这些是 `mars create` 生成的每个项目都内置的约定。权威版本随项目一起交付，位于
项目根目录的 `AGENTS.md` —— 它同时也是 AI 编码助手读取的上下文 —— 本页是面向
站点读者的镜像。

## 目录规则

- **内部设计文档**放 `.docs/` —— 接口文档放 `.docs/api/`，任务与 PRD 放
  `.docs/task/`。该目录刻意以点号开头：它是内部工程资料，不会被发布。
- **对外发布的页面**放 `docs/content/`，即文档站点的内容目录。
- **设计资源**（设计稿、图片、切图）放 `design/`。
- **平台代码**放 `apps/<platform>/`；共享 npm 包放 `packages/`。
- 文档与设计文件都不得放在仓库根目录。临时文件请放系统临时目录，不要污染项目树。

## 文档站点

`docs/` 是一个 Docusaurus 站点，页面存放在它自己的 `content/` 子目录中，使站点配置
与正文互不混杂。由此带来几点实际影响：

- 新增页面：在 `docs/content/` 下创建 Markdown 文件，并把它的 id 加入
  `docs/sidebars.ts`。未登记在其中的文件不会被发布。
- 内部任务拆解与接口文档完全不属于站点，它们位于 `.docs/`。
- 中文译文位于
  `docs/i18n/zh-Hans/docusaurus-plugin-content-docs/current/`，
  文件名与英文原文一一对应。译文树镜像的是 `content/` 的**内容**，因此没有多出一层
  `content/`。
- 界面文案在 `docs/i18n/zh-Hans/code.json` 中翻译；可用
  `pnpm write-translations -- --locale zh-Hans` 重新生成骨架。

该站点**不是平台**。平台指的是可交付的应用目标，而文档描述的是这个项目本身，而不是
项目交付的某个目标产物。因此 `docs/` 不在 `platforms.json` 的 `platforms` 之内 ——
它被声明在单独的顶层 `docs` 段中 —— 也不是 pnpm workspace 成员。这样可以让 Docusaurus
庞大的依赖树不进入根 lockfile，也不进入 Turborepo 的任务图，代价是 `pnpm --filter docs`
无法解析。在仓库根目录用 `pnpm -C docs <script>` 运行它的脚本，`-C` 只是切换目录，
不走 workspace 解析。

## 提交信息

提交信息**必须使用英文**，并遵循 conventional commits：

```
<type>(<scope>): <subject>

<body>

<footer>
```

允许的类型：`feat`、`fix`、`docs`、`style`、`refactor`、`test`、`chore`、
`perf`、`ci`、`revert`。

容易出错的几点：

- 使用祈使语气 —— 写 “Add”，不要写 “Added” 或 “I added”。
- 首行不超过 50 字符，结尾不加句号，首字母大写。
- 首行与正文之间空一行；正文按 72 字符换行。
- 正文同样必须是英文，包括列表项。
- 一个提交只做一件逻辑上的事，不要混入无关改动。

## 分支

`main` 为主干。功能分支 `feature/xxx`，修复分支 `fix/xxx`。

## 代码风格

- **代码注释统一使用英文**，包括 Dockerfile、compose 文件，以及
  `docusaurus.config.ts` 这类配置文件。
- 遵循你正在编辑的文件已有的约定 —— 风格、命名，以及它已经依赖的库。
- 每个平台目录都有自己的 `AGENTS.md`，记录该平台的专属规范；改动前请先阅读。

## 忽略文件

`.idea/`、`.gradle/`、`local.properties`、`node_modules/`、`dist/`、`.turbo/`、
`.docusaurus/`、`/docs/build` 与 `.env` 均已加入 gitignore。注意构建产物是
按精确路径忽略的，而不是用裸的 `build/` 规则，因为 `apps/web-admin/build/` 是被
纳入版本管理的源码（Vite 构建配置）。切勿提交密钥 —— 请使用 `.env`，并把
`.env.example` 作为带说明的模板保留。
