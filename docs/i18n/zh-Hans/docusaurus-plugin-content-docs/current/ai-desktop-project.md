---
id: ai-desktop-project
title: 创建项目
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 构建桌面应用：创建项目

三句提示词，按顺序说。走完之后，你屏幕上会真的弹出一个窗口。桌面应用是一个整体：没有单独的后端、没有数据库、也不用在浏览器里打开什么——这个应用就是那个窗口本身。

:::tip 先做环境准备那一页
本页假设你的电脑已经准备好了——见[开始一个项目](./ai-start.md)。
:::

## 第 1 步之前 —— 自己先装好系统库

Tauri 需要项目内任何包管理器都给不了的原生部件：Windows 上的 C++ 生成工具链、macOS 上的 Xcode 命令行工具、Linux 上的 WebKitGTK 库。Agent 和 `mars init` 都装不了这些，请现在手动装好。Rust 本身会在第 2 步由项目推导并安装。

<Tabs groupId="os">
<TabItem value="windows" label="Windows (PowerShell)">

安装 Visual Studio Build Tools，**必须勾选“使用 C++ 的桌面开发”（Desktop development with C++）工作负载**。工作负载比安装包本身更关键：只装包不勾工作负载，之后 `cargo build` 会报找不到 `link.exe`：

```powershell
winget install --id Microsoft.VisualStudio.2022.BuildTools -e
```

WebView2 在 Windows 11 和当前的 Windows 10 上已预装，只有缺失时才需要安装：

```powershell
winget install --id Microsoft.EdgeWebView2Runtime -e
```

</TabItem>
<TabItem value="unix" label="macOS / Linux">

在 macOS 上安装 Xcode 命令行工具（它也提供一个可用的 `git`）：

```bash
xcode-select --install
```

在 Linux 上通过发行版包管理器安装 WebKitGTK 及其配套库，不同发行版的包集合不同：

```bash
# Debian / Ubuntu（apt）
apt-get install -y libwebkit2gtk-4.1-dev build-essential curl wget file \
  libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev
# Fedora / RHEL（dnf）
dnf install -y webkit2gtk4.1-devel openssl-devel curl wget file \
  libappindicator-gtk3-devel librsvg2-devel
dnf group install -y "C Development Tools and Libraries"
# Arch（pacman）
pacman -S --noconfirm webkit2gtk-4.1 base-devel curl wget file openssl \
  appmenu-gtk-module libappindicator-gtk3 librsvg
```

当前发行版上包名是 `webkit2gtk-4.1`，较旧的发行版是 `4.0`——用包管理器先查一下，而不是猜包名。

</TabItem>
</Tabs>

**不要**自己装 Rust，它会在第 2 步自动装好。完整的手动路线（包括 Rust 的安装）在[桌面端环境准备页](./guide-desktop-env.md#system-libraries-and-webview)上。

## 第 1 步 —— 创建项目

> **提示词**
>
> 在这个目录里新建一个叫 `my-desktop` 的桌面应用，我只要桌面应用本身，别的都不要。工具会停下来问你要创建哪些部分：把它打印出来的列表读完，挑写着 `Desktop` 的那一行。

这个组合不是默认的，所以 Agent 必须真的去回答那个提问，不能跳过。

**你应该看到：** 一条确认信息，只有一个部分。

```
✅ Selected 1 modules:
   - Desktop
```

然后追问："你实际创建了哪些部分？"答案应该只有桌面应用。如果冒出了别的东西，就说："删掉重做一遍，这次要回答那个选择提问。"

:::caution 认名字，别认编号
列表一变编号就会跟着挪，所以别人告诉你的编号迟早会指错东西。永远让 Agent 把列表读完，挑标着 `Desktop` 的那一行。
:::

## 第 2 步 —— 安装项目需要的东西

> **提示词**
>
> 把配置文件按模板准备好，把这个项目需要的东西都装上。我在中国大陆。

说清你在哪很重要：下载源选错了，几分钟的安装会变得漫长。

**你应该看到：** 项目最外层出现一个配置文件，安装过程没有报错就结束了。Rust 也是在这一步装上的——它在[配环境](./ai-start.md)那一步是故意跳过的：第 1 步把项目建出来之前，谁也不知道你要做的是桌面应用。

然后追问："桌面应用自己的代码目录在不在？"如果不在，说明应用根本没被创建出来，你得回到第 1 步。

## 第 3 步 —— 启动它，看一眼

> **提示词**
>
> 把桌面应用启动起来，告诉我窗口什么时候应该开好了。

**你应该看到：** 屏幕上真的弹出一个窗口，那个窗口就是应用。此后你要的每个改动都会在几秒内自己出现——你不用重启任何东西，也不用敲任何构建命令。

:::note 应用运行期间
应用会一直跑到你关掉它为止，所以 Agent 会自动用不耽误跟你说话的方式启动它，你不用特意要求。一片白的窗口不是崩溃：负责画界面的部分还没跑起来——就说："窗口是白的——画界面的那个服务真的在跑吗？"
:::

窗口开出来之后，空架子就搭好了。下一步：[创建功能](./ai-desktop-module.md)。

## 卡住了怎么办

你不需要自己诊断。找到你看到的现象，把对应那句话说出去：

| 你看到什么 | 这样说 |
| ---------- | ------ |
| 多创建了别的部分，不只是桌面应用 | "你跳过了那个选择提问。删掉重做，这次要回答那个列表" |
| 启动应用时报 command not found | "开一个新的终端窗口再试——这个窗口里的信息是旧的" |
| 窗口开了但一片全白 | "窗口是白的——画界面的那个服务真的在跑吗？" |
| Agent 很久没说话了 | "你是不是在等一个永远不会结束的东西？换一种不会耽误你跟我说话的方式启动" |
