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
Set me up to build a Marsquakes admin system on this computer. Install only the
basics for now — the backend's own tools can wait until the project exists. Run
the database in Docker, and run the project itself directly on my machine. Tell
me what was missing before you install anything.
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

Nothing gets installed "just in case" here. This step only puts the few programs
on your computer that every Marsquakes project needs, whatever you are building:

| Program | Needs to be | If it is older |
| ------- | ----------- | -------------- |
| Node.js | 22.12.0 or newer | the Marsquakes tool itself will not run |
| pnpm | 9.0.0 or newer | installing the project's pieces fails |
| git | 2.20.0 or newer | the project cannot be created |
| Docker | 20.10.0 or newer | the database will not start at all |
| Docker Compose | 2.0.0 or newer | this is a hard failure, not a warning — anything starting with `1.` cannot read this project's files |

The backend's own tools — Java and Maven — are **deliberately not in that list**.
They only make sense once a project exists and says it has a backend, so they get
installed in [Step 2](./ai-admin-prompts.md#step-2--install-what-the-project-needs)
instead. If an agent offers to install them now, say: "not yet — install those
when you initialise the project."

If any row is old rather than missing, say: "that version is too old — replace it
with a supported one, do not work around it."

:::note Why Docker is on the list but Java is not
Docker is here because *this page* has already decided to run the database in a
box — that is a choice you made, not something derived from the project. Java and
Maven depend on what the project turns out to contain, which nothing knows yet.
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
