---
id: ai-android-project
title: Create the Project
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Building an Android App: Create the Project

Three things to say, in order. At the end the app icon appears on a phone or
emulator, and it opens. An Android app is one thing — no separate backend, no
database, nothing in a browser; the app opens on the phone screen.

:::tip Do the setup page first
This page assumes your computer is already prepared — see
[Start a Project](./ai-start.md).
:::

## Before Step 1 — nothing you must install by hand

Everything an Android build needs is a language toolchain — a host JDK 17,
Google's `android` CLI and the SDK packages (`platforms/android-36`,
`build-tools/36.0.0`, `platform-tools`), all derived from the project you are
about to create and installed in Step 2. There is nothing you must install
before Step 1.

To do it by hand anyway — on a machine where the agent cannot install anything
— run the three steps below, then **open a new terminal** after the installer
finishes. Every line is explained on the
[Android environment page](./guide-android-env.md#1-install-a-host-jdk-17).

<Tabs groupId="os">
<TabItem value="windows" label="Windows (PowerShell)">

```powershell
# 1. Host JDK 17 (or: mise use --global java@temurin-17)
winget install --id EclipseAdoptium.Temurin.17.JDK -e
# 2. Google's android CLI
curl.exe -fsSL "https://dl.google.com/android/cli/latest/windows_x86_64/install.cmd" -o "$env:TEMP\android-install.cmd"
& "$env:TEMP\android-install.cmd"
# 3. SDK packages — run this after opening the new terminal
android --sdk="$env:LOCALAPPDATA\Android\Sdk" sdk install platforms/android-36 build-tools/36.0.0 platform-tools
```

</TabItem>
<TabItem value="unix" label="macOS / Linux">

```bash
# 1. Host JDK 17 (or: mise use --global java@temurin-17)
brew install --cask temurin@17        # macOS; on Linux use your distro's openjdk-17-jdk package
# 2. Google's android CLI — pick the line for your machine
curl -fsSL "https://dl.google.com/android/cli/latest/darwin_arm64/install.sh" | bash   # Apple Silicon Mac
curl -fsSL "https://dl.google.com/android/cli/latest/darwin_x86_64/install.sh" | bash  # Intel Mac
curl -fsSL "https://dl.google.com/android/cli/latest/linux_x86_64/install.sh" | bash   # x86_64 Linux
# 3. SDK packages — run this after opening the new terminal
android --sdk="$HOME/Library/Android/sdk" sdk install platforms/android-36 build-tools/36.0.0 platform-tools  # macOS
android --sdk="$HOME/Android/Sdk" sdk install platforms/android-36 build-tools/36.0.0 platform-tools          # Linux
```

</TabItem>
</Tabs>

Google publishes no CLI binary for ARM Linux. Prefer the IDE instead? Android
Studio's first-run setup bundles the SDK manager, platform tools and an
acceptable JDK in one go:

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
# Linux: download from developer.android.com — the distro packages lag badly
```

</TabItem>
</Tabs>

Install the **JDK**, not the JRE — JDK 21 also works, JDK 11 does not. Step 3
also needs a real phone connected by USB with debugging enabled, or an emulator
already running — the agent cannot set that up for you.

## Step 1 — Create the project

> **Say this**
>
> Create a new Android app called `my-android` in this folder. I only want the
> Android app itself, nothing else. The tool will stop and ask which pieces to
> create: read the list it prints and pick the line that says `Android`.

That is not the default, so the agent must answer the question, not skip it.

**What you should see:** a confirmation of exactly one piece.

```
✅ Selected 1 modules:
   - Android
```

Then ask "which pieces did you actually create?" It should be only the Android
app. If anything else appeared, say "delete it and do it again, and this time
answer the selection question."

:::caution Say the name, never a number
The numbers move as the list changes, so a number you were given once will
eventually point at the wrong thing. Have the agent read the list and pick the
`Android` line.
:::

## Step 2 — Install what the project needs

> **Say this**
>
> Set up the environment file and install everything this project needs. I am
> in mainland China.

Saying where you are matters: the wrong download source makes a short install
very long.

**What you should see:** a settings file at the top of the project and an
install that finishes without errors. The Android SDK and JDK also arrive here
if missing — deliberately skipped during
[setup](./ai-start.md#what-ready-should-look-like), because nothing knew you
wanted an Android app until Step 1 created one. No database step: the app keeps
its data on the phone.

Then ask "is the Android app's own code folder there?" If not, the app was
never created — go back to Step 1.

## Step 3 — Install it on a phone or emulator

Have a USB-connected phone (debugging enabled) or a running emulator ready
*before* you speak — the agent builds before it checks for a device.

> **Say this**
>
> Build the debug version of the Android app, install it on my device, and tell
> me when it is ready to open.

**What you should see:** the app icon appearing on your phone or emulator. Open
it and it should launch.

:::caution Make sure the device is ready first
If the build finishes but the agent cannot install it, say: "my device is
connected — check again and install it."
:::

:::note An emulator is a full phone, not a quick preview
Starting one takes a few minutes and noticeable resources. If you are new to
this, a USB phone is simpler — what matters is seeing the app run.
:::

When the icon is on the device and the app opens, the skeleton is done. Next:
[Create a Feature](./ai-android-module.md).

## When it goes wrong

You do not diagnose anything — find your symptom, say the sentence:

| What you see | Say this |
| ------------ | -------- |
| Extra pieces were created, not just the Android app | "You skipped the selection question. Delete it and do it again, answering the list" |
| A "command not found" error when running a Gradle command | "Open a new terminal window and try again — this one has stale information" |
| The agent says "no device found" | "The device is connected. Check again — it may need a moment to be recognised" |
| The app installs but crashes on open | "Read the crash log from logcat and tell me what the first error says" |
| The agent has been silent for a long time | "Are you waiting on something that never finishes? Start it the way that lets you keep talking to me, and tell me when it is up" |
