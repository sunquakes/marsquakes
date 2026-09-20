---
id: guide-desktop-develop
title: 如何开发
---

# 桌面端：如何开发

Tauri 工具链把前端和 Rust 后端一起运行。先确认 Rust 工具链和原生系统库已经装好
—— 见[环境准备](./guide-desktop-env.md)。

## 第 1 步 —— 运行完整桌面应用

在平台目录执行：

```bash
cd apps/desktop
pnpm tauri dev
```

这会启动 Vite 开发服务器、以 debug 模式编译 Rust 侧，然后打开原生窗口。第一次
运行会久一些，因为 Cargo 要先构建它的依赖。

## 第 2 步 —— 只做前端，用浏览器

只想在浏览器标签里做纯前端开发（没有 Rust，也没有原生窗口）：

```bash
cd apps/desktop
pnpm dev
```

## 项目结构

前端代码（React）在 `src/`，Rust 后端在 `src-tauri/src/`；两侧通过 Tauri 命令
通信（Rust 侧是 `#[tauri::command]`，前端是 `invoke()`）。SQLite 通过 `sqlx`
访问。新增模块之前先读 `apps/desktop/AGENTS.md` —— 它记录了每模块一个文件的布局
（`src/api/`、`src/components/<module>/`、`src-tauri/src/api/<module>.rs`）、
IPC 响应结构，以及十一步模块工作流和完整示例。

## 第 3 步 —— 让 AI Agent 替你开发功能

在仓库根目录运行的 AI 编程助手可以替你加功能，你用大白话指挥它就行。完整的对话
过程，包括看到异常时该说什么，在 AI 那条线上：
[桌面应用：创建功能](./ai-desktop-module.md)。简版如下：

1. 保持第 1 步的应用在运行（`pnpm tauri dev`）。
2. 粘贴下面的提示词，然后**等方案出来**，批准之前什么都别动。
3. 完成后让窗口重新加载，亲手把每个新按钮都点一遍。

```text
先读 `apps/desktop/AGENTS.md`，按里面那套分步流程来，改任何东西之前先把方案给我看。
我要一个商品管理界面：我要能新增、编辑、删除商品，两种语言都要能用。做完把你
改了哪些文件列出来。
```

一个完整界面会碰到 `apps/desktop/AGENTS.md` 里说的全部三层 —— 存储、连接两侧
的 Tauri 命令、React 界面 —— 所以预计大约十个改动文件。那种*看起来像成功了*
的失败，是前端调用了某个命令、Rust 侧却根本没登记：界面能显示出来，只有点按钮
的一瞬间才报错。如果文件清单很短或按钮报错，就说：“你漏了一层，或者只接了一半，
再读一遍那个流程文件，把它补完。”记得先要方案，一次只加一个功能。

## 下一步

应用按预期运行之后，继续看[部署](./guide-desktop-deploy.md)，产出安装包。
