---
id: guide-android-deploy
title: 部署
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Android：部署

Android 部署意味着构建用于分发或上传到商店渠道的发布版 APK。

## 第 1 步 —— 通过 CLI 构建发布版 APK

`mars build --platform android` 会替你跑发布任务：

```bash
mars build --platform android
```

## 第 2 步 —— 自己调用 Gradle

<Tabs groupId="os">
<TabItem value="unix" label="macOS / Linux">

```bash
cd apps/android

./gradlew assembleRelease      # 发布版 APK 输出到 app/build/outputs/apk/
./gradlew test                 # JVM 单元测试
./gradlew connectedAndroidTest # 设备/模拟器上的插桩测试
./gradlew clean                # 删除构建产物
```

</TabItem>
<TabItem value="windows" label="Windows (PowerShell)">

```powershell
cd apps/android

.\gradlew.bat assembleRelease      # 发布版 APK 输出到 app/build/outputs/apk/
.\gradlew.bat test                 # JVM 单元测试
.\gradlew.bat connectedAndroidTest # 设备/模拟器上的插桩测试
.\gradlew.bat clean                # 删除构建产物
```

</TabItem>
</Tabs>

`connectedAndroidTest` 与 `installDebug` 一样需要设备或模拟器（见
[如何开发](./guide-android-develop.md)）。

## 下一步

工作区范围的 `mars dev`、`mars build` 和 `mars clean`，见
[开始一个项目](./create-project.md#运行和构建项目)；其他移动端目标的成熟度见
[平台](./platforms.md#the-platform-matrix)。
