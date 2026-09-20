---
id: ai-android-project
title: 创建项目
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 构建 Android 应用：创建项目

三句话，按顺序说。走完之后，手机或模拟器上会出现应用图标，点开能启动。Android 应用是一个整体：没有单独的后端、不用跑数据库、也不用在浏览器里打开什么——应用在手机屏幕上打开。

:::tip 先做环境准备那一页
这一页假设你的电脑已经准备好了——见[开始一个项目](./ai-start.md)。
:::

## 第 1 步之前 —— 没有必须手动安装的东西

Android 构建需要的一切都是语言工具链——宿主机 JDK 17、Google 的 `android` CLI，以及 SDK 包（`platforms/android-36`、`build-tools/36.0.0`、`platform-tools`），全部由你即将创建的项目推导出来，在第 2 步安装。所以第 1 步之前没有你必须手动装的东西。

如果你仍然想手动完成这一部分——比如在一台 Agent 无法安装任何东西的机器上——按操作系统执行下面三步，并在安装器结束后**打开一个新终端**。每行命令的解释都在[Android 环境准备页](./guide-android-env.md#1-install-a-host-jdk-17)上。

<Tabs groupId="os">
<TabItem value="windows" label="Windows (PowerShell)">

```powershell
# 1. 宿主机 JDK 17（或：mise use --global java@temurin-17）
winget install --id EclipseAdoptium.Temurin.17.JDK -e
# 2. Google 的 android CLI
curl.exe -fsSL "https://dl.google.com/android/cli/latest/windows_x86_64/install.cmd" -o "$env:TEMP\android-install.cmd"
& "$env:TEMP\android-install.cmd"
# 3. SDK 包 —— 打开新终端后再执行
android --sdk="$env:LOCALAPPDATA\Android\Sdk" sdk install platforms/android-36 build-tools/36.0.0 platform-tools
```

</TabItem>
<TabItem value="unix" label="macOS / Linux">

```bash
# 1. 宿主机 JDK 17（或：mise use --global java@temurin-17）
brew install --cask temurin@17        # macOS；Linux 用发行版的 openjdk-17-jdk 包
# 2. Google 的 android CLI —— 选你机器对应的那一行
curl -fsSL "https://dl.google.com/android/cli/latest/darwin_arm64/install.sh" | bash   # Apple 芯片 Mac
curl -fsSL "https://dl.google.com/android/cli/latest/darwin_x86_64/install.sh" | bash  # Intel 芯片 Mac
curl -fsSL "https://dl.google.com/android/cli/latest/linux_x86_64/install.sh" | bash   # x86_64 Linux
# 3. SDK 包 —— 打开新终端后再执行
android --sdk="$HOME/Library/Android/sdk" sdk install platforms/android-36 build-tools/36.0.0 platform-tools  # macOS
android --sdk="$HOME/Android/Sdk" sdk install platforms/android-36 build-tools/36.0.0 platform-tools          # Linux
```

</TabItem>
</Tabs>

Google 没有为 ARM Linux 发布 CLI 二进制。更愿意用 IDE 的话，Android Studio 的首次运行向导会一并装好 SDK 管理器、platform tools 和可用的 JDK：

<Tabs groupId="os">
<TabItem value="windows" label="Windows (PowerShell)">

```powershell
winget install --id Google.AndroidStudio -e
```

</TabItem>
<TabItem value="unix" label="macOS / Linux">

```bash
# macOS
brew install --cask android-studio
# Linux：从 developer.android.com 下载 —— 发行版包陈旧得厉害
```

</TabItem>
</Tabs>

装 **JDK**，不要装 JRE——JDK 21 也可以，JDK 11 不行。第 3 步还需要一台用 USB 连接并开启调试的真机，或者一个已经在运行的模拟器——Agent 没法替你准备设备。

## 第 1 步 —— 创建项目

> **提示词**
>
> 在这个文件夹里创建一个叫 `my-android` 的新项目，我只要 Android 应用本身，别的都不要。工具会停下来问你要创建哪些部分：读它列出来的清单，挑那行写着 `Android` 的。

这不是默认组合，所以 Agent 必须真的回答那个提问，不能跳过。

**你应该看到：** 确认只创建了一个端。

```
✅ Selected 1 modules:
   - Android
```

然后问："你实际创建了哪些部分？"答案应该只有 Android 应用。如果还出现了别的，就说："删掉重来，这次回答那个选择列表。"

:::caution 要说名字，不要说编号
列表一变编号就会跟着挪，所以别人告诉你的编号迟早会指错东西。永远让 Agent 读列表，挑写着 `Android` 的那一行。
:::

## 第 2 步 —— 安装项目需要的东西

> **提示词**
>
> 配好环境文件，然后把这个项目需要的东西都装上。我在中国大陆。

说清你在哪很重要：下载源选错了，几分钟的安装会变得漫长。

**你应该看到：** 项目根目录出现一个配置文件，安装过程没有报错。Android SDK 和 JDK 也是在这一步装上的——它们在[配环境](./ai-start.md)那一步是故意跳过的：第 1 步把项目建出来之前，谁也不知道你要做 Android 应用。这里不需要数据库步骤：应用把数据存在手机上。

然后问："Android 应用的代码目录在不在？"如果不在，说明应用根本没创建成功，回到第 1 步。

## 第 3 步 —— 装到手机上

说提示词*之前*，先把一台开着 USB 调试的真机连好，或者让模拟器跑起来——Agent 会先构建，再检查设备。

> **提示词**
>
> 构建 Android 应用的调试版，装到我的设备上，装好了告诉我。

**你应该看到：** 手机或模拟器上出现应用图标，点开它，应该能启动。

:::caution 先确保设备就绪
如果构建成功了但 Agent 装不上，就说："我的设备连着——重新检测一下，然后装上去。"
:::

:::note 模拟器是一台完整的手机，不是快速预览
启动模拟器需要几分钟，也会占用不少资源。如果你刚开始，用 USB 连一台真机更简单——重要的是能看到应用跑起来。
:::

设备上出现图标、应用能打开之后，空架子就搭好了。下一步：[创建功能](./ai-android-module.md)。

## 卡住了怎么办

你不需要自己诊断。找到你看到的现象，把对应那句话说出去：

| 你看到什么 | 这样说 |
| ---------- | ------ |
| 多创建了别的部分，不只是 Android 应用 | "你跳过了那个选择提问。删掉重做，这次要回答那个列表" |
| 跑 Gradle 命令时报 command not found | "开一个新的终端窗口再试——这个窗口里的信息是旧的" |
| Agent 说"没找到设备" | "设备连着——重新检测一次，可能要多等一下才能识别到" |
| 应用装上了，但一打开就闪退 | "读一下 logcat 里的崩溃日志，告诉我第一条错误是什么" |
| Agent 很久没说话了 | "你是不是在等一个永远不会结束的东西？换一种不会耽误你跟我说话的方式启动，起来了告诉我" |
