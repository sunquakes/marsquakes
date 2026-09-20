---
id: ai-desktop-deploy
title: Package It
---

# Building a Desktop App: Package It

Once the feature from [Create a Feature](./ai-desktop-module.md) works in the
development window, say one thing. At the end you have an installer file you can
send to someone, who double-clicks it.

## Step 1 — Build the installer

> **Say this**
>
> Build the finished, release version of the desktop app, and tell me exactly
> where the installer file ended up.

**What you should see:** one real file path ending in your computer's installer
kind — `.msi` or `.exe` on Windows, `.dmg` on macOS, `.deb` or `.AppImage` on
Linux. Ask for the actual path: "the build succeeded" is not checkable, a file
you can look at is.

That file is the thing you send to someone. They do not need any of the programs
you installed.

:::note There is no shortcut for this one
Unlike the admin system, this app cannot be packaged inside Docker — it has to be
built on a real computer, and on the same kind of computer as the people you are
sending it to. If an agent starts looking for a Docker way to do it, say: "there
is no Docker path for the desktop app, build it directly."
:::

## When it goes wrong

You do not need to diagnose anything. Find your symptom, say the sentence:

| What you see | Say this |
| ------------ | -------- |
| The build fails on a different style file each time | "Check the required build setting in the top-level AGENTS.md — do not change the version pins" |
| The agent has been silent for a long time | "Are you waiting on something that never finishes? Start it the way that lets you keep talking to me, and tell me when it is up" |
| The agent starts looking for a Docker way to build | "There is no Docker path for the desktop app, build it directly" |
