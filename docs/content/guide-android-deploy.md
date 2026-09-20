---
id: guide-android-deploy
title: Deploy
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Android: Deploy

Android deployment means building the release APK you distribute or upload to a
store track.

## Step 1 — Build a release APK through the CLI

`mars build --platform android` runs the release task for you:

```bash
mars build --platform android
```

## Step 2 — Invoke Gradle yourself

<Tabs groupId="os">
<TabItem value="unix" label="macOS / Linux">

```bash
cd apps/android

./gradlew assembleRelease      # release APK into app/build/outputs/apk/
./gradlew test                 # JVM unit tests
./gradlew connectedAndroidTest # instrumented tests on a device/emulator
./gradlew clean                # remove build artifacts
```

</TabItem>
<TabItem value="windows" label="Windows (PowerShell)">

```powershell
cd apps/android

.\gradlew.bat assembleRelease      # release APK into app/build/outputs/apk/
.\gradlew.bat test                 # JVM unit tests
.\gradlew.bat connectedAndroidTest # instrumented tests on a device/emulator
.\gradlew.bat clean                # remove build artifacts
```

</TabItem>
</Tabs>

`connectedAndroidTest` requires the same device or emulator as `installDebug`
(see [Develop](./guide-android-develop.md)).

## Next

For workspace-wide `mars dev`, `mars build` and `mars clean`, see
[Start a Project](./create-project.md#run-and-build-the-project), or
[Platforms](./platforms.md#the-platform-matrix) for the maturity of the other
mobile targets.
