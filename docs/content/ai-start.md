---
id: ai-start
title: Start a Project
---

# Start a Project

Agent and skill are installed. On this page you decide *what to build* and get
the computer ready for it — in one step, because what needs installing is decided
by what you picked. Nothing installs anything you did not pick, and you never
type a command: you paste the prompts and check what comes back.

## Which one are you building?

You do not have to get this right for good — a project can gain another piece
later (see [the last section](#if-you-add-another-piece-later)) — so pick whatever
you want to *see working first*.

| If you want | Pick | It is |
| ----------- | ---- | ----- |
| A website you log into to manage things — products, orders, users, articles | **Admin system** | Two halves: the pages you look at, and the backend that stores the data |
| A real application that installs on a computer and opens in its own window | **Desktop app** | One piece. Keeps its own data in a file, needs nothing running alongside it |
| An app that installs on a phone | **Android app** | One piece, but it has to be built with the phone's own toolchain |

The difference that matters most:

| | Needs a database running | Where it can be built |
| --- | --- | --- |
| Admin system | yes — in Docker | anywhere |
| Desktop app | no | only on the kind of computer it is for |
| Android app | no | anywhere, with the phone toolchain installed |

:::danger A desktop app has to be built on the computer it is for
A Windows app on Windows, a macOS app on macOS — no shortcut. If an agent offers
to build it inside Docker to skip the setup, that will not work: say no and let
it install the tools properly.
:::

## Say this to get set up

The sentence is the same shape whichever you picked. Name what you are building
and ask what is missing *before* anything gets installed:

```text
Set me up to build a Marsquakes <admin system | desktop app | Android app> on this
computer. Install only the basics for now — the tools that belong to the project
itself can wait until the project exists. Tell me what was missing before you
install anything.
```

The agent already knows what to install, in what order, for your operating
system — you do not need to supply a list.

**What you should see:** a plain list of what your computer was missing, then the
installs, then a second check confirming everything is now present.

:::tip A finished installer is not proof
An installer can finish and still install nothing useful. What counts is the
second check — something that was missing is now found. If the agent skips it,
say: "check again and show me the results".
:::

## What "ready" should look like

Nothing gets installed "just in case". Every project needs these three:

| Program | Needs to be | If it is older |
| ------- | ----------- | -------------- |
| Node.js | 22.12.0 or newer | the Marsquakes tool itself will not run |
| pnpm | 9.0.0 or newer | installing the project's pieces fails |
| git | 2.20.0 or newer | the project cannot be created |

If a row is old rather than missing, say: "that version is too old — replace it
with a supported one, do not work around it."

Then, depending on your pick, one more thing has to be present *now*, because no
tool can install it later for you:

| If you picked | Also needed now | Why it cannot wait |
| ------------- | --------------- | ------------------ |
| Admin system | Docker 20.10.0+ and Docker Compose 2.0.0+ | You chose to run the database in a box, so this is your decision, not something derived from the project. Compose starting with `1.` is a hard failure, not a warning — it cannot read this project's files |
| Desktop app | Your operating system's build tools | No tool can install these for you — see [the table below](#what-your-operating-system-needs) |
| Android app | nothing extra | The phone toolchain is derived from the project, so it waits |

Everything else — Java, Maven, Rust, the Android SDK — is **deliberately on
neither list**. It depends on what the project turns out to contain, which nothing
knows yet, so it installs while the project is initialised. If an agent offers it
now, say: "not yet — install those when you initialise the project."

:::note Why Docker is on a list but Java never is
Docker is there because *you* decided to run the database in a box. Java, Maven
and Rust depend on what the project contains — and no project exists yet.
:::

## What your operating system needs

Only if you picked a desktop app. These package names change between versions, so
send the agent to the official list instead of letting it guess:

```text
Read https://v2.tauri.app/start/prerequisites/ and install what it lists for my
operating system.
```

**What you should see:** the agent names the packages it installed, and they match
what that page lists for your computer.

| Your computer | What gets installed | What you should see afterwards |
| ------------- | ------------------- | ------------------------------ |
| Windows | Microsoft's build tools — the browser component is already part of Windows 10 and later | the compiler responds instead of "not recognized" |
| macOS | Apple's command line developer tools | a path such as `/Library/Developer/CommandLineTools` |
| Linux | a handful of system graphics and web libraries | each one reports a version number |

:::caution "Cargo is missing" right after installing it successfully
This looks broken and is not. The terminal was opened before the install
finished, so it has stale information. Say: "open a fresh terminal and check again
before you reinstall anything."
:::

## Two things an agent must not "improve"

This project pins some versions on purpose. They look outdated, and a helpful
agent will offer to update them — producing errors that blame something unrelated
(one reports a memory problem, the other a corrupted database), so you would never
guess the cause. Paste this so the agent knows not to touch them:

```text
Before you change anything in this project, read the AGENTS.md file at the top
level and tell me which versions and build settings it says must not be changed.
```

**What you should see:** the agent names specific version pins and one build
setting, and explains it must leave them alone. If it cannot answer, it has not
read the file — and will eventually "fix" one of them. Say: "read the file
properly and answer again."

And if a failed download ever makes it suggest swapping download sources:

```text
If downloads are failing, set a proxy in Docker's own settings. Do not switch to
a different download mirror.
```

## If you add another piece later

Say a working admin system later needs a desktop app alongside it. Enabling it is
a change to the project, and the project decides which programs are needed — so
ask for the install step again:

> **Say this**
>
> Turn on the desktop app for this project, then install whatever it now needs.

**What you should see:** Rust being installed this time, and Java left alone
because it is already there.

This is why nothing was installed up front: nobody could have known you would want
the desktop app too, so guessing would mean installing everything on the chance
you might. Asking the project keeps the answer right when you change your mind —
you just ask for the install step again.

## Next

Go to the application page for what you picked:

| What you picked | Next |
| --------------- | ---- |
| Admin system | [Building an Admin System: Create the Project](./ai-admin-project.md) |
| Desktop app | [Building a Desktop App: Create the Project](./ai-desktop-project.md) |
| Android app | [Building an Android App: Create the Project](./ai-android-project.md) |
