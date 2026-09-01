---
id: platforms
title: 平台
sidebar_position: 4
---

# 平台

平台就是 `mars create` 里可勾选的一个目标端。本页介绍每个端包含什么，以及生成的
项目如何管理它们。

## 平台矩阵

| 平台      | 目录             | 技术栈                   | 默认勾选 | 成熟度   |
| --------- | ---------------- | ------------------------ | -------- | -------- |
| API       | `apps/api`       | JeecgBoot / Spring Boot  | 是       | 可用     |
| Web Admin | `apps/web-admin` | Vue 3 + Vite             | 是       | 可用     |
| 桌面端    | `apps/desktop`   | Tauri + React + Rust     | 否       | 可用     |
| Web       | `apps/web`       | 待定                     | 否       | 仅有骨架 |
| Android   | `apps/android`   | Kotlin + Jetpack Compose | 否       | 仅有骨架 |
| iOS       | `apps/ios`       | Swift + SwiftUI          | 否       | 仅有骨架 |
| Windows   | `apps/windows`   | 待定                     | 否       | 仅有骨架 |
| Linux     | `apps/linux`     | 待定                     | 否       | 仅有骨架 |
| macOS     | `apps/macos`     | 待定                     | 否       | 仅有骨架 |

「可用」表示该端开箱即可构建、运行；「仅有骨架」表示目录与规范已经就位，但应用
代码还是占位的 —— 想先把结构占住可以选，想今天就跑起来则暂时用处不大。

本文档站点没有出现在上表中，这是有意为之。它位于 `docs/`，描述的是项目本身，而
不是项目交付的某个目标产物，因此它不是平台 —— 参见[约定](./conventions.md)。

## `platforms.json`

项目根目录的 `platforms.json` 是所有工具读取的注册表。`mars dev`、`mars build`、
`mars clean` 与 `scripts/init.js` 的平台列表都由它推导得出，代码里没有任何硬编码
路径。

```jsonc
{
  "platforms": {
    "mobile":  { "android": { "enabled": false, "dir": "apps/android", ... } },
    "desktop": { "desktop": { "enabled": true,  "dir": "apps/desktop", ... } },
    "web":     { "web-admin": { "enabled": true, "dir": "apps/web-admin", ... } },
    "api":     { "api": { "enabled": true, "dir": "apps/api", ... } }
  },
  // 文档不是平台，因此放在 "platforms" 之外
  "docs": {
    "site_dir": "docs",
    "site_content_dir": "docs/content",
    "internal_dir": ".docs"
  }
}
```

这个文件由 `mars create` 自动写好 —— 你勾选的端为 `"enabled": true`，其余为
`false`。

只有 `platforms` 内部的条目才是平台。工具链遍历的对象读取的都只是这个对象，所以
这些命令永远不会启动、构建或脚手架化文档站点。

每个平台条目包含：

| 字段          | 含义                                            |
| ------------- | ----------------------------------------------- |
| `enabled`     | `mars dev` / `mars build` 是否处理该平台        |
| `dir`         | 平台目录，相对项目根目录                        |
| `tech_stack`  | 可读的技术栈描述                                |
| `description` | 工具链输出中展示的简短说明                      |
| `status`      | 可选；`developing` 表示这是一个占位平台         |

## 创建之后再启用某个平台

如果 `mars create` 时没有勾选某个端，之后又想要它，那么该目录**从未被复制过** ——
所以只把 `enabled` 改成 `true` 是不够的。有两种做法：

1. **另外生成一个临时项目**，勾上这个端，把 `apps/<platform>` 目录拷过来，再把
   `enabled` 改成 `true`。
2. **自己按下面的步骤新建这个平台。**

## 新增平台

1. 在 `platforms.json` 对应分类下添加条目。
2. 在 `apps/` 下创建目录。
3. 在该目录内添加 `AGENTS.md`，记录平台专属规范。
4. 更新根 `AGENTS.md` 里的平台表格。

## 平台专属规范

每个平台目录都有自己的 `AGENTS.md`，描述其构建命令、编码标准与注意事项。改动该
平台前请先阅读 —— 这些文件同时也是 AI 编码助手加载的上下文。
