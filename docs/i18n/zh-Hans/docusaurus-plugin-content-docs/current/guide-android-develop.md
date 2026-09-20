---
id: guide-android-develop
title: 如何开发
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Android：如何开发

开发意味着构建 debug APK 并安装到已连接的设备或模拟器上。先确认 JDK、Android
CLI 和 SDK 包都已就位 —— 见[环境准备](./guide-android-env.md) —— 并且接上了
一台开启 USB 调试的手机，或一个运行中的模拟器。

## 第 1 步 —— 通过 CLI 运行

CLI 把 Android 开发接到 Gradle wrapper 的 `installDebug` 任务上，它会构建 debug
APK 并安装到已连接的设备或模拟器：

```bash
mars dev --platform android
```

## 第 2 步 —— 直接驱动 Gradle

在 `apps/android/` 里运行 wrapper。操作系统之间唯一不同的是 wrapper 文件名
本身：

<Tabs groupId="os">
<TabItem value="unix" label="macOS / Linux">

```bash
cd apps/android

./gradlew assembleDebug        # 构建 debug APK
./gradlew installDebug         # 构建并安装到设备/模拟器
```

</TabItem>
<TabItem value="windows" label="Windows (PowerShell)">

```powershell
cd apps/android

.\gradlew.bat assembleDebug    # 构建 debug APK
.\gradlew.bat installDebug     # 构建并安装到设备/模拟器
```

</TabItem>
</Tabs>

构建出的 APK 落在 `app/build/outputs/apk/`。

## 项目结构

应用代码位于 `app/src/main/java/com/sunquakes/marsquakes/`，资源在
`app/src/main/res/`，JVM 单元测试在 `app/src/test/`，插桩测试在
`app/src/androidTest/`。依赖版本集中在 `gradle/libs.versions.toml`；仓库只允许
使用 `google()` 和 `mavenCentral()` 作为仓库源。动手改平台代码之前，先读
`apps/android/AGENTS.md` 了解编码规范和仓库规则。

## 第 3 步 —— 让 AI Agent 替你开发功能

在仓库根目录运行的 AI 编程助手可以替你加功能，你用大白话指挥它，然后在手机上
检查结果。完整的对话过程，包括看到异常时该说什么，在 AI 那条线上：
[Android 应用：创建功能](./ai-android-module.md)。简版如下：

1. 保持一台开了 USB 调试的手机连着电脑，或让模拟器保持运行。
2. 粘贴下面的提示词，然后**等方案出来**，批准之前什么都别动。
3. 完成后重新安装调试版 APK（`installDebug`），亲手在设备上打开新界面。

```text
先读 `apps/android/AGENTS.md`，按里面的约定做，然后改任何东西之前先把计划给我看。
我要一个商品管理界面：能新增、编辑、删除商品，并且两种语言都能用。改完之后列出你
改过的每一个文件。
```

一个完整界面会碰到 `apps/android/AGENTS.md` 里说的全部三层 —— 存储/数据、连接
层、Compose 界面 —— 所以预计大约十个改动文件。界面能显示、一按按钮却报错，通常
就是有一层只接了一半；遇到这种情况或文件清单很短，就说：“你漏了一层，重新看一下
约定文件，把它补完。”改动只有装进设备后才算数，所以一定要重装并在手机上亲手试
一下。记得先要方案，一次只加一个功能。

## 下一步

当应用能按你想要的方式安装并运行后，继续看[部署](./guide-android-deploy.md)
了解发布版 APK。
