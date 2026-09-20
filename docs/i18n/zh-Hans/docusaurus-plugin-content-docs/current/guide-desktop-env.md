---
id: guide-desktop-env
title: 环境准备
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 桌面端：环境准备

`apps/desktop` 里的跨平台桌面应用是一个 Tauri 2 应用：React 19 + Vite 前端
与 Rust 后端打包在一起，数据本地存储在 SQLite 中。一份代码产出 Windows、
macOS 和 Linux 安装包。成熟度：**可运行**。

Tauri 要针对宿主机编译原生代码，所以前置条件分两类：Rust 工具链，以及每个
操作系统原生的构建工具 —— Windows 上的 MSVC 与 WebView2、macOS 上的 Xcode
命令行工具、Linux 上的 GTK/WebKitGTK 库。启用 `desktop` 时 `mars init` 会替
你安装 **Rust**；系统级库和 WebView 是版本管理器装不了的系统包，所以下面两
步专门处理它们。

## 第 1 步 —— 安装 Rust 工具链（1.77.0 或更新）

推荐路径是 mise，它在底层安装 rustup 并驱动它 —— 与 `mars init` 执行的是同
一行。先安装 mise 并激活 shell 钩子：

<Tabs groupId="os">
<TabItem value="unix" label="macOS / Linux">

```bash
brew install mise            # 装了 Homebrew 的 macOS
# 或者，在没有 Homebrew 的 macOS / Linux 上：
curl https://mise.run | sh

echo 'eval "$(~/.local/bin/mise activate bash)"' >> ~/.bashrc
echo 'eval "$(~/.local/bin/mise activate zsh)"'  >> ~/.zshrc
echo '~/.local/bin/mise activate fish | source'  >> ~/.config/fish/config.fish
```

</TabItem>
<TabItem value="windows" label="Windows (PowerShell)">

```powershell
winget install jdx.mise
(& mise activate pwsh) | Out-String | Invoke-Expression
```

</TabItem>
</Tabs>

固定 Rust 版本，再打开一个新终端：

```bash
mise use --global rust
```

`mise doctor` 会报告 shell 钩子是否生效。不想用 mise 就直接装 rustup
—— 绝不要装发行版自带的 `rustc`，它能满足 `command -v rustc`，版本却对
Tauri 2 太旧：

```bash
# Windows（PowerShell）：winget install --id Rustlang.Rustup -e
# macOS / Linux：
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

## 第 2 步 —— 安装系统库与 WebView {#system-libraries-and-webview}

无论 Rust 本身怎么装，这些都要按操作系统分别安装。Windows 上 MSVC 的工作
负载比 Build Tools 包本身更关键：只装包、不勾选 **“使用 C++ 的桌面开发”
（Desktop development with C++）** 工作负载会没有编译器，`cargo build`
随后报的是找不到 `link.exe`。

<Tabs groupId="os">
<TabItem value="unix" label="macOS / Linux">

在 macOS 上安装 Xcode 命令行工具（它也提供一个可用的 `git`）：

```bash
xcode-select --install
```

在 Linux 上通过发行版包管理器安装 WebKitGTK 及其配套库。不同发行版的包集合
不同：

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

当前发行版上 WebKitGTK 包名是 `4.1`，较旧的发行版是 `4.0` —— 用包管理器先
查一下，而不是猜包名。

</TabItem>
<TabItem value="windows" label="Windows (PowerShell)">

安装 Visual Studio Build Tools，然后运行安装器并勾选
**“使用 C++ 的桌面开发”（Desktop development with C++）** 工作负载：

```powershell
winget install --id Microsoft.VisualStudio.2022.BuildTools -e
```

WebView2 在 Windows 11 和当前的 Windows 10 上已预装；只有缺失时才需要安装：

```powershell
winget install --id Microsoft.EdgeWebView2Runtime -e
```

</TabItem>
</Tabs>

## 下一步

Rust 和原生库就位之后，继续看[如何开发](./guide-desktop-develop.md)。
