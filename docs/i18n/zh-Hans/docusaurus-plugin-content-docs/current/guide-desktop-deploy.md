---
id: guide-desktop-deploy
title: 部署
---

# 桌面端：部署

桌面端部署意味着产出一个已签名/可安装的分发包，交给运行相同操作系统的人。

## 第 1 步 —— 构建发布包

```bash
cd apps/desktop
pnpm tauri build
```

这会在 `src-tauri/target/release/bundle/` 下为当前操作系统产出已签名/可安装的
分发包 —— Windows 上是 MSI/NSIS 安装器，macOS 上是 `.app` 加 `.dmg`，Linux 上
是 deb/AppImage/rpm 包。

## 第 2 步 —— 清楚 `pnpm build` 不会做什么

单独跑 `pnpm build` 只做前端类型检查和 Vite 构建，**不会**产出桌面安装包：

```bash
pnpm build   # tsc && vite build —— 只有前端产物
```

这一区别也解释了为什么 `mars build --platform desktop` 跑的是 workspace 前端构建
而不是 Tauri 打包器：原生安装包的打包必须在 `apps/desktop` 里、且平台自己的工具链
在场时才能进行 —— `pnpm tauri build` 才是产出可分发产物的命令。

## 下一步

workspace 级别的 `mars dev`、`mars build` 和 `mars clean` 见
[开始一个项目](./create-project.md#运行和构建项目)，或见
[CLI 参考](./cli.md#mars-dev)。
