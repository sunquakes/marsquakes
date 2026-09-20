---
id: guide-android-env
title: Environment Setup
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Android: Environment Setup

The Android app in `apps/android` is Kotlin with Jetpack Compose and Material 3,
built with the Gradle wrapper. Maturity: **Scaffold only** — the project builds
and reserves the structure, but the screens are still placeholders.

An Android build needs three things: a host **JDK 17** (Gradle runs on the
host), Google's **Android CLI**, and the **Android SDK** packages derived from
`compileSdk`. When `android` is enabled, `mars init` prepares all three — JDK,
CLI, SDK packages — and writes `sdk.dir` into
`apps/android/local.properties`; re-run it after changing the SDK level. The
steps below are the manual route for a machine without `mars init`.

## Step 1 — Install a host JDK 17 {#1-install-a-host-jdk-17}

The CLI never replaces a JDK — the Gradle daemon runs on the host JVM. With mise
already installed (see [Environment Setup](./install.md)), pin Temurin 17 — the
same line `mars init` runs:

```bash
mise use --global java@temurin-17
```

If mise is new on this machine, install it and activate its shell hook first,
then open a new terminal (the hook also sets `JAVA_HOME`):

<Tabs groupId="os">
<TabItem value="unix" label="macOS / Linux">

```bash
brew install mise            # macOS with Homebrew
# or, on macOS or Linux without Homebrew:
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

Without mise, install a system **JDK** (not a JRE):
`winget install --id EclipseAdoptium.Temurin.17.JDK -e` on Windows,
`brew install --cask temurin@17` on macOS, or `openjdk-17-jdk` /
`java-17-openjdk-devel` / `jdk17-openjdk` through your Linux package manager.
Do not mix a mise JDK with a system JDK. JDK 21 also works; JDK 11 does not.

## Step 2 — Install the Android CLI {#2-install-the-android-cli}

Google's agent-first `android` CLI is a single user-scoped binary that needs no
admin rights — it is not the SDK's `sdkmanager`. Run Google's own installer:

<Tabs groupId="os">
<TabItem value="unix" label="macOS / Linux">

```bash
# Apple Silicon Mac
curl -fsSL "https://dl.google.com/android/cli/latest/darwin_arm64/install.sh" | bash
# Intel Mac
curl -fsSL "https://dl.google.com/android/cli/latest/darwin_x86_64/install.sh" | bash
# x86_64 Linux — the only Linux triple Google publishes
curl -fsSL "https://dl.google.com/android/cli/latest/linux_x86_64/install.sh" | bash
```

The installer appends a `PATH` export to your shell profile and places the
binary in `$HOME/.local/bin`.

</TabItem>
<TabItem value="windows" label="Windows (PowerShell)">

```powershell
curl.exe -fsSL "https://dl.google.com/android/cli/latest/windows_x86_64/install.cmd" -o "$env:TEMP\android-install.cmd"
& "$env:TEMP\android-install.cmd"
```

The installer writes `PATH` into `HKCU\Environment` and places the binary under
`%USERPROFILE%\AppData\AndroidCLI`. **Open a new terminal** afterwards. Google
publishes no binary for ARM Linux — use
[Android Studio](#4-alternative-android-studio) there. There is no version floor;
the CLI is checked for presence only, and `android emulator` is disabled on
Windows by Google — use Android Studio's Device Manager there.

</TabItem>
</Tabs>

## Step 3 — Install the SDK packages {#3-install-the-sdk-packages}

The package set is derived from `compileSdk` in
`apps/android/app/build.gradle.kts` — API 36 here, expanded to
`platforms/android-36`, `build-tools/36.0.0` and `platform-tools`. Pass the SDK
location with the global `--sdk` flag, which must precede the subcommand:

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

These are the same conventional locations Android Studio uses, so the two share
one SDK. An existing `ANDROID_HOME` / `ANDROID_SDK_ROOT` always wins — point
`--sdk` at that path if it is set. Otherwise Gradle discovers the SDK through
`sdk.dir` in `apps/android/local.properties` (backslashes must be doubled there
because Java `.properties` treats one as an escape); the file is gitignored,
per-machine, and an existing `sdk.dir` is never rewritten.

## Step 4 — Alternative: Android Studio {#4-alternative-android-studio}

If you want the IDE anyway, its first-run setup bundles the SDK manager,
platform tools and an acceptable JDK:

<Tabs groupId="os">
<TabItem value="unix" label="macOS / Linux">

```bash
# macOS
brew install --cask android-studio
# Linux: download from developer.android.com — the distro packages lag badly
```

</TabItem>
<TabItem value="windows" label="Windows (PowerShell)">

```powershell
winget install --id Google.AndroidStudio -e
```

</TabItem>
</Tabs>

## Project SDK settings

| Setting | Value |
| ------- | ----- |
| `minSdk` | 33 |
| `targetSdk` | 36 |
| `compileSdk` | 36 |
| Gradle | 8.13 (Kotlin DSL) |
| JVM target | Java 11 |
| Package | `com.sunquakes.marsquakes` |

To install a debug build you also need a connected handset with USB debugging,
or a running emulator.

## Next

With the JDK, CLI and SDK in place — and a device or emulator ready — continue
to [Develop](./guide-android-develop.md).
