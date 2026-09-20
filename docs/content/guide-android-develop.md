---
id: guide-android-develop
title: Develop
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Android: Develop

Development means building the debug APK and installing it on a connected
device or emulator. Make sure the JDK, Android CLI and SDK packages are ready —
see [Environment Setup](./guide-android-env.md) — and that a handset with USB
debugging, or a running emulator, is attached.

## Step 1 — Run through the CLI

The CLI wires Android development to the Gradle wrapper's `installDebug` task,
which builds and installs the debug APK on a connected device or emulator:

```bash
mars dev --platform android
```

## Step 2 — Drive Gradle directly

Run the wrapper from inside `apps/android/`. The wrapper filename is the only
thing that changes between operating systems:

<Tabs groupId="os">
<TabItem value="unix" label="macOS / Linux">

```bash
cd apps/android

./gradlew assembleDebug        # build the debug APK
./gradlew installDebug         # build and install on a device/emulator
```

</TabItem>
<TabItem value="windows" label="Windows (PowerShell)">

```powershell
cd apps/android

.\gradlew.bat assembleDebug    # build the debug APK
.\gradlew.bat installDebug     # build and install on a device/emulator
```

</TabItem>
</Tabs>

The built APK lands in `app/build/outputs/apk/`.

## Project layout

App code lives in `app/src/main/java/com/sunquakes/marsquakes/`, with resources
in `app/src/main/res/`, JVM unit tests in `app/src/test/` and instrumented tests
in `app/src/androidTest/`. Dependency versions are centralised in
`gradle/libs.versions.toml`; only `google()` and `mavenCentral()` may be used as
repositories. Before changing platform code, read `apps/android/AGENTS.md` for
the coding standards and repository rules.

## Step 3 — Let an AI agent build a feature

An AI coding agent running in the repository root can add the feature while you
drive it in ordinary sentences and check the result on the phone. The full
conversation, including what to say when something looks wrong, is on the AI
track: [Android App: Create a Feature](./ai-android-module.md). The short
version:

1. Keep a handset with USB debugging attached, or an emulator running.
2. Paste the prompt below, then **wait for the plan** before approving anything.
3. When it is done, reinstall the debug APK (`installDebug`) and open the new
   screen on the device yourself.

```text
Read `apps/android/AGENTS.md` first and follow the conventions in it, then show
me your plan before changing anything. I want a product management screen: I
should be able to add, edit and delete products, and it should work in both
languages. List every file you changed when you are done.
```

A complete screen touches all three layers in `apps/android/AGENTS.md` —
storage/data, the connecting code, and the Compose screen — so expect roughly
ten changed files. A screen that renders but errors the moment a button is
pressed usually means a layer was left half-wired; if that happens or the file
list looks short, say: "you missed a layer, check the conventions file again and
finish it." Changes only exist after they are installed onto a device, so always
reinstall and try the action on the phone. Ask for the plan first, and add one
feature at a time.

## Next

When the app installs and runs the way you want, continue to
[Deploy](./guide-android-deploy.md) for the release APK.
