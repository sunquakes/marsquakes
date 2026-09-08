---
id: ai-desktop-env
title: Desktop App Setup
sidebar_position: 1
---

# Getting Your Computer Ready: Desktop App

A **desktop app** is a real application that installs on a computer and opens in
its own window — not in a browser. It stores its own data and needs nothing else
running alongside it.

Because it becomes a real program for a real operating system, it needs a couple
of build tools that a website does not. You will not install them yourself. One
sentence does it.

:::danger This one has to be built on your own computer
An app for Windows has to be built on Windows, an app for macOS on macOS. There is
no shortcut around this. If an agent offers to build it inside Docker to skip the
setup, that will not work — say no and let it install the tools properly.
:::

## Say this to get set up

```text
Set me up to build a Marsquakes desktop app on this computer. Install the basics
and whatever build tools my operating system needs — Rust can wait until the
project exists. Tell me what was missing before you install anything.
```

The agent already knows the right list for your operating system, so you do not
need to supply one.

**What you should see:** a list of what was missing, then the installs, then a
second check confirming everything is now found.

:::tip A finished installer is not proof
Ask for the second check if the agent skips it: "check again and show me the
results." Something moving from missing to found is the only thing that counts.
:::

## What "ready" should look like

Only two of these are installed now. The rest of the list is here so you know what
"finished" eventually means:

| Program | Needs to be | Installed |
| ------- | ----------- | --------- |
| Node.js | 22.12.0 or newer | now — the Marsquakes tool is itself a Node program |
| Your system's build tools | present — see the table below | now — no tool can install these for you |
| Rust | 1.77.0 or newer | in [Step 2](./ai-desktop-prompts.md#step-2--install-what-the-project-needs), once the project says it is a desktop app |
| Cargo | present, with a version number | arrives with Rust |

The two halves split that way for a reason. Your operating system's build tools
have to be installed by hand whatever you end up building, so there is no point
waiting. Rust is only needed because you chose a desktop app — so it waits until a
project exists that actually says so.

:::note If Rust comes out too old
The version bundled with some operating systems is too old for this project. If
the agent reports anything below 1.77.0, say: "that came from the system package
and is too old — install Rust properly through rustup instead."
:::

:::caution "Cargo is missing" right after installing it successfully
This looks broken and is not. The terminal window was opened before the install
finished, so it has stale information. Say: "open a fresh terminal and check again
before you reinstall anything."
:::

## What your operating system needs

| Your computer | What gets installed | What you should see afterwards |
| ------------- | ------------------- | ------------------------------ |
| Windows | Microsoft's build tools — the browser component is already part of Windows 10 and later | the compiler responds instead of "not recognized" |
| macOS | Apple's command line developer tools | a path such as `/Library/Developer/CommandLineTools` |
| Linux | a handful of system graphics and web libraries | each one reports a version number |

These package names change between versions, so it is better to send the agent to
the official list than to let it guess:

```text
Read https://v2.tauri.app/start/prerequisites/ and install what it lists for my
operating system.
```

**What you should see:** the agent names the packages it installed, and they match
what that page lists for your computer.

## Nothing else to start

Unlike the admin system, there is no separate database to run. This app keeps its
data in a single file, creates that file the first time it starts, and needs
nothing running in the background. There is nothing left to set up.

If you later need a shared database that several people use at once, say so and
the agent will switch it over — at which point
[Admin System Setup](./ai-admin-env.md) applies as well.

## Next

[Building a Desktop App](./ai-desktop-prompts.md) — six things to say, from an
empty folder to an installer you can hand to someone.
