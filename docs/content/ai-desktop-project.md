---
id: ai-desktop-project
title: Create the Project
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Building a Desktop App: Create the Project

Three prompts, said in order; at the end a real window opens on your screen. A
desktop app is one thing — no backend, no database, no browser; the app *is*
the window.

:::tip Do the setup page first
This page assumes your computer is already prepared — see
[Start a Project](./ai-start.md).
:::

## Before Step 1 — install the system libraries yourself

A Tauri app needs native pieces no package manager can provide: a C++ toolchain
on Windows, the Xcode command line tools on macOS, WebKitGTK on Linux. Neither
the agent nor `mars init` can install them — do it by hand now. Rust arrives
in Step 2, derived from the project.

<Tabs groupId="os">
<TabItem value="windows" label="Windows (PowerShell)">

Install the Visual Studio Build Tools **with the "Desktop development with C++"
workload** — the workload matters more than the package, or `cargo build` later
fails on a missing `link.exe`:

```powershell
winget install --id Microsoft.VisualStudio.2022.BuildTools -e
```

WebView2 is preinstalled on Windows 11 and current Windows 10; install it only
if missing:

```powershell
winget install --id Microsoft.EdgeWebView2Runtime -e
```

</TabItem>
<TabItem value="unix" label="macOS / Linux">

On macOS, install the Xcode command line tools (they also provide a usable
`git`):

```bash
xcode-select --install
```

On Linux, install WebKitGTK and its companion libraries through your distro's
package manager — the set varies by distribution:

```bash
# Debian / Ubuntu (apt)
apt-get install -y libwebkit2gtk-4.1-dev build-essential curl wget file \
  libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev
# Fedora / RHEL (dnf)
dnf install -y webkit2gtk4.1-devel openssl-devel curl wget file \
  libappindicator-gtk3-devel librsvg2-devel
dnf group install -y "C Development Tools and Libraries"
# Arch (pacman)
pacman -S --noconfirm webkit2gtk-4.1 base-devel curl wget file openssl \
  appmenu-gtk-module libappindicator-gtk3 librsvg
```

The package is `webkit2gtk-4.1` on current releases and `4.0` on older ones —
check with your package manager rather than guessing a name.

</TabItem>
</Tabs>

Do **not** install Rust yourself; it arrives in Step 2. The full manual route,
including the Rust install, is on the
[Desktop environment page](./guide-desktop-env.md#system-libraries-and-webview).

## Step 1 — Create the project

> **Say this**
>
> Create a new desktop app called `my-desktop` in this folder. I only want the
> desktop app itself, nothing else. The tool will stop and ask which pieces to
> create: read the list it prints and pick the line that says `Desktop`.

That is not the default, so the agent must answer the question, not skip it.

**What you should see:** a confirmation of exactly one piece.

```
✅ Selected 1 modules:
   - Desktop
```

Then ask "which pieces did you actually create?" It should be only the desktop
app. If anything else appeared, say "delete it and do it again, and this time
answer the selection question."

:::caution Say the name, never a number
The numbers move as the list changes, so a number you were given once will
eventually point at the wrong thing. Have the agent read the list and pick the
`Desktop` line.
:::

## Step 2 — Install what the project needs

> **Say this**
>
> Set up the environment file and install everything this project needs. I am
> in mainland China.

Saying where you are matters: the wrong download source makes a short install
very long.

**What you should see:** a settings file at the top of the project and an
install that finishes without errors. Rust also arrives here if it was missing
— deliberately skipped during [setup](./ai-start.md#what-ready-should-look-like),
because nothing knew you wanted a desktop app until Step 1 created one.

Then ask "is the desktop app's own code folder there?" If not, the app was
never created — go back to Step 1.

## Step 3 — Start it and look at it

> **Say this**
>
> Start the desktop app and tell me when the window should be open.

**What you should see:** a real window opening on your screen — that window
is the app. Changes you ask for later appear within a few seconds; you restart
nothing and type no build commands.

:::note While it runs
The app runs until you close it, so the agent starts it in a way that lets it
keep talking meanwhile — its default behaviour; you need not ask. A blank white
window is not a crash: the screen-drawing part is not up yet — say "the window
is blank — is the development server actually running?"
:::

When the window opens, the skeleton is done. Next:
[Create a Feature](./ai-desktop-module.md).

## When it goes wrong

You do not diagnose anything — find your symptom, say the sentence:

| What you see | Say this |
| ------------ | -------- |
| Extra pieces were created, not just the desktop app | "You skipped the selection question. Delete it and do it again, answering the list" |
| A "command not found" error when starting the app | "Open a new terminal window and try again — this one has stale information" |
| The window opens completely blank | "The window is blank — is the development server actually running?" |
| The agent has been silent for a long time | "Are you waiting on something that never finishes? Start it the way that lets you keep talking to me" |
