---
id: guide-android-env
title: 环境准备
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Android：环境准备

`apps/android` 里的 Android 应用是 Kotlin + Jetpack Compose + Material 3，用
Gradle wrapper 构建。成熟度：**仅脚手架** —— 项目能构建、结构也预留好了，
但界面仍然是占位的。

Android 构建需要三样东西：宿主机上的 **JDK 17**（Gradle 在宿主机运行）、
Google 的 **Android CLI**，以及从 `compileSdk` 推导出来的 **Android SDK** 包。
启用 `android` 时，`mars init` 会把三样都准备好 —— JDK、CLI、SDK 包 —— 并把
`sdk.dir` 写入 `apps/android/local.properties`；改动 SDK 级别之后重跑它即可。
下面是没有运行 `mars init` 时的手动路径。

## 第 1 步 —— 安装宿主机 JDK 17 {#1-install-a-host-jdk-17}

CLI 替代不了 JDK —— Gradle 守护进程跑在宿主机 JVM 上。装好 mise 之后（见
[环境准备](./install.md)），固定 Temurin 17 —— 这正是 `mars init` 执行的那一
行：

```bash
mise use --global java@temurin-17
```

如果这台机器还没有 mise，先安装它并激活 shell 钩子，再打开一个新终端（这个钩子
同时负责设置 `JAVA_HOME`）：

<Tabs groupId="os">
<TabItem value="unix" label="macOS / Linux">

```bash
brew install mise            # 装了 Homebrew 的 macOS
# 或者，在没有 Homebrew 的 macOS / Linux 上：
curl https://mise.run | sh
echo 'eval "$(~/.local/bin/mise activate bash)"' >> ~/.bashrc
echo 'eval "$(~/.local/bin/mise activate zsh)"'  >> ~/.zshrc
```

</TabItem>
<TabItem value="windows" label="Windows (PowerShell)">

```powershell
winget install jdx.mise
(& mise activate pwsh) | Out-String | Invoke-Expression
```

</TabItem>
</Tabs>

不用 mise 的话，安装系统级 **JDK**（不是 JRE）：Windows 用
`winget install --id EclipseAdoptium.Temurin.17.JDK -e`，macOS 用
`brew install --cask temurin@17`，Linux 用包管理器装 `openjdk-17-jdk` /
`java-17-openjdk-devel` / `jdk17-openjdk`。不要把 mise 的 JDK 和系统 JDK 混用。
JDK 21 也可以，JDK 11 不行。

## 第 2 步 —— 安装 Android CLI {#2-install-the-android-cli}

Google 面向 agent 的 `android` CLI 是单个用户级二进制，不需要管理员权限 —— 它
不是 SDK 的 `sdkmanager`。运行 Google 官方安装器：

<Tabs groupId="os">
<TabItem value="unix" label="macOS / Linux">

```bash
# Apple 芯片 Mac
curl -fsSL "https://dl.google.com/android/cli/latest/darwin_arm64/install.sh" | bash
# Intel 芯片 Mac
curl -fsSL "https://dl.google.com/android/cli/latest/darwin_x86_64/install.sh" | bash
# x86_64 Linux —— Google 发布的唯一一个 Linux 三元组
curl -fsSL "https://dl.google.com/android/cli/latest/linux_x86_64/install.sh" | bash
```

安装器把 `PATH` 导出追加到 shell 配置文件，二进制放在 `$HOME/.local/bin`。

</TabItem>
<TabItem value="windows" label="Windows (PowerShell)">

```powershell
curl.exe -fsSL "https://dl.google.com/android/cli/latest/windows_x86_64/install.cmd" -o "$env:TEMP\android-install.cmd"
& "$env:TEMP\android-install.cmd"
```

安装器把 `PATH` 写入 `HKCU\Environment`，二进制放在
`%USERPROFILE%\AppData\AndroidCLI` 下。结束后**打开一个新终端**。Google 没有为
ARM Linux 发布二进制；那种环境请改用
[Android Studio](#4-alternative-android-studio)。该工具没有版本下限，只检查是否
存在；Google 还在 Windows 上停用了 `android emulator`，模拟器请用 Android
Studio 的 Device Manager。

</TabItem>
</Tabs>

## 第 3 步 —— 安装 SDK 包 {#3-install-the-sdk-packages}

包集合从 `apps/android/app/build.gradle.kts` 里的 `compileSdk` 推导 —— 本项目
是 API 36，展开成 `platforms/android-36`、`build-tools/36.0.0` 和
`platform-tools`。用全局标志 `--sdk` 指定 SDK 位置，它必须位于子命令之前：

<Tabs groupId="os">
<TabItem value="unix" label="macOS / Linux">

```bash
# macOS
android --sdk="$HOME/Library/Android/sdk" sdk install platforms/android-36 build-tools/36.0.0 platform-tools
# Linux
android --sdk="$HOME/Android/Sdk" sdk install platforms/android-36 build-tools/36.0.0 platform-tools
```

</TabItem>
<TabItem value="windows" label="Windows (PowerShell)">

```powershell
android --sdk="$env:LOCALAPPDATA\Android\Sdk" sdk install platforms/android-36 build-tools/36.0.0 platform-tools
```

</TabItem>
</Tabs>

这些与 Android Studio 选用的约定位置相同，所以两者共用一个 SDK。已有的
`ANDROID_HOME` / `ANDROID_SDK_ROOT` 总是优先 —— 如果已设置，就把 `--sdk` 指向
那个路径。否则 Gradle 通过 `apps/android/local.properties` 里的 `sdk.dir` 发现
SDK（该文件里反斜杠必须双写，因为 Java `.properties` 把单反斜杠当转义符）；此
文件被 gitignore、是每台机器各自的，已有的 `sdk.dir` 永远不会被改写。

## 第 4 步 —— 备选：Android Studio {#4-alternative-android-studio}

如果你本来就想要 IDE，它在首次运行向导里一并提供 SDK 管理器、platform tools
和可用的 JDK：

<Tabs groupId="os">
<TabItem value="unix" label="macOS / Linux">

```bash
# macOS
brew install --cask android-studio
# Linux：从 developer.android.com 下载 —— 发行版包陈旧得厉害
```

</TabItem>
<TabItem value="windows" label="Windows (PowerShell)">

```powershell
winget install --id Google.AndroidStudio -e
```

</TabItem>
</Tabs>

## 项目的 SDK 设置

| 设置 | 值 |
| ---- | -- |
| `minSdk` | 33 |
| `targetSdk` | 36 |
| `compileSdk` | 36 |
| Gradle | 8.13（Kotlin DSL） |
| JVM 目标 | Java 11 |
| 包名 | `com.sunquakes.marsquakes` |

要安装 debug 构建，还需要一台开启 USB 调试的已连接手机，或一个运行中的模拟器。

## 下一步

JDK、CLI 和 SDK 都就位、设备或模拟器也准备好之后，继续看
[如何开发](./guide-android-develop.md)。
