---
id: ai-admin-env
title: Admin System Setup
sidebar_position: 1
---

# Getting Your Computer Ready: Admin System

An **admin system** is the kind of website you log into to manage things —
products, orders, users, articles. It has two halves: the website you look at, and
the backend that stores the data.

This page is the boring part: making sure your computer has the programs the
project needs. You will not install any of them yourself. You say one sentence,
and the agent does it.

## What runs where, and why you should care

Only one thing on this page is worth understanding, because it explains most of
what the agent will do later:

| Part | Runs | In plain terms |
| ---- | ---- | -------------- |
| The database | inside **Docker** | A ready-made box you never open. If it ever gets into a mess, throwing the box away and starting fresh is one sentence |
| Your actual project | **directly on your computer** | This is the part you change. Running it directly is what makes your changes appear instantly |

:::info Your own code never goes inside a box while you are building
Docker here is just a convenient way to run a database. If an agent ever suggests
putting your project inside Docker while you are still working on it, say no — it
makes every change slower to see and errors much harder to read. Docker is for
the very last step, when you package everything up for other people. See
[Step 6](./ai-admin-prompts.md#step-6--package-it-up-for-other-people).
:::

## Say this to get set up

```text
Set me up to build a Marsquakes admin system on this computer. Run the database
in Docker, and run the project itself directly on my machine. Tell me what was
missing before you install anything.
```

That is the whole setup step. The agent already knows what to install, in what
order, for your operating system — you do not need a list.

**What you should see:** a plain list of what your computer was missing, then the
installs, then a second check confirming everything is now present.

:::tip A finished installer is not proof
An installer can finish and still have installed nothing useful. What counts is
the second check — the one where something that used to be missing is now found.
If the agent skips that, ask for it: "check again and show me the results".
:::

## What "ready" should look like

You do not need to know what any of these are. You only need the agent to confirm
all five are present, and to flag it if a version is too old:

| Program | Needs to be | If it is older |
| ------- | ----------- | -------------- |
| Docker | 20.10.0 or newer | the database will not start at all |
| Docker Compose | 2.0.0 or newer | this is a hard failure, not a warning — anything starting with `1.` cannot read this project's files |
| Java (JDK) | version 17 | the backend cannot run. Version 21 is also fine; 11 is not |
| Maven | 3.9 or newer | the backend cannot be built |
| Node.js and pnpm | installed earlier | not specific to this page |

If any row is old rather than missing, say: "that version is too old — replace it
with a supported one, do not work around it."

:::caution "Java works but something says JAVA_HOME is not set"
This looks broken and is not. The terminal window it is running in was opened
before Java finished installing, so it has stale information. Say: "open a fresh
terminal and check again before you reinstall anything." Reinstalling Java will
not help.
:::

## Starting the database

> **Say this**
>
> Start the database and the cache for this project in Docker. Confirm both are
> healthy before you do anything else.

:::warning Passwords have to be right the first time
The database remembers its password from the very first time it starts and
ignores every later change. Getting this wrong means an "access denied" error that
can only be fixed by deleting the database and starting over — losing anything
stored in it. So add this to your prompt: "put the database passwords in the
`.env` file **before** you start anything for the first time."
:::

**What you should see:** the agent reports both pieces as `running`. If one is
stuck restarting over and over, the very first startup failed. Say: "read that
container's log from the beginning and tell me the first error." The real cause
scrolls past long before the repeating message you can see.

Nothing needs configuring after this. The project is already set up to look for
the database exactly where it now is.

:::note If the agent starts editing database addresses, stop it
There are settings in this project that look like database addresses but only
apply when the project is packaged up inside Docker. An agent that changes them
while you are still building will break the backend, and the error message will
not tell you why. Say: "leave the database host settings alone — I am running the
project directly on my machine."
:::

## Two things an agent must not "improve"

This project pins some versions on purpose. They look outdated, and an agent
trying to be helpful will offer to update them. Both cases produce errors that
blame something completely unrelated — one reports a memory problem, the other
reports a corrupted database — so you would never guess the real cause.

You do not need to know the details. You need the agent to know it should not
touch them:

```text
Before you change anything in this project, read the AGENTS.md file at the top
level and tell me which versions and build settings it says must not be changed.
```

**What you should see:** the agent names some specific version pins and one build
setting, and explains it must leave them alone. If it cannot answer, it has not
read the file — and it will eventually "fix" one of them. Say: "read the file
properly and answer again."

One more thing worth telling it, if it ever suggests swapping where programs are
downloaded from because a download failed:

```text
If downloads are failing, set a proxy in Docker's own settings. Do not switch to
a different download mirror.
```

## Next

[Building an Admin System](./ai-admin-prompts.md) — six things to say, from an
empty folder to something you could give to someone else.
