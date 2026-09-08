---
id: ai-admin-prompts
title: Admin System Prompts
sidebar_position: 2
---

# Building an Admin System

Six things to say, in order. Each one has a result you can check without reading
any code.

An admin system is a **matching pair**: the website you look at, and the backend
that holds the data. Asking for them separately gets you two projects that do not
know each other exist, so every prompt here treats them as one thing.

:::tip Do the setup page first
This page assumes your computer is already prepared — see
[Admin System Setup](./ai-admin-env.md).
:::

## Step 1 — Create the project

> **Say this**
>
> Create a new project called `admin-platform` in this folder. I only need the
> backend and the admin website — no phone app, no desktop app, no public
> website. Use the Marsquakes tool to create it.

**What you should see:** a confirmation of exactly two pieces.

```
✅ Selected 2 modules:
   - Web Admin
   - API Service
```

Then ask: "which pieces did you actually create?" The answer should name only
those two. Anything else means it built the wrong thing — say "delete it and do it
again with only those two" rather than trying to remove the extras.

:::tip This is the easy combination
Backend plus admin website is the default, so the tool does not need to stop and
ask anything. Every other combination — including a
[desktop app](./ai-desktop-prompts.md) — makes it stop and ask, and the agent has
to answer instead of skipping.
:::

## Step 2 — Install what the project needs

> **Say this**
>
> Set up the environment file and install everything this project needs,
> including the tools the backend itself needs. I am in mainland China. Put the
> database passwords in place before anything starts up for the first time.

Mentioning where you are matters. Downloads come from different places depending
on your country, and picking the wrong one turns a two-minute install into a
twenty-minute crawl.

**What you should see:** a settings file at the top of your project with the
passwords filled in, and an install that finishes without errors.

This is also the step where Java and Maven arrive, if they were not already on
your computer. They were skipped during
[setup](./ai-admin-env.md#what-ready-should-look-like) on purpose — nothing knew
you wanted a backend until Step 1 created one. The project now says so, so the
tool works it out and installs them without being asked.

:::caution "Java works but something says JAVA_HOME is not set"
This looks broken and is not. The terminal window it is running in was opened
before Java finished installing, so it has stale information. Say: "open a fresh
terminal and check again before you reinstall anything." Reinstalling Java will
not help.
:::

:::note An install that crawls is not an install that failed
If it seems to be inching along forever, it is almost always downloading from the
wrong side of the world. Say: "switch to the download sources for my region and
try again." Do not sit and wait it out.
:::

## Step 3 — Start it and open it

Your project runs **directly on your computer**. Only the database sits inside
Docker. Nothing you edit goes in a box.

> **Say this**
>
> Start the database in Docker, then start the backend and the admin website on
> my computer in the background. Tell me the web address for each one.

**What you should see:** two addresses. The admin website is the one you open in
your browser; the backend answers at `http://localhost:8080/jeecg-boot` and is not
meant to look like anything.

Nothing else needs configuring — the backend already knows where to find the
database you just started.

:::caution Say "in the background", or the agent will appear to freeze
Both halves keep running until you stop them, which means an agent that starts one
normally will sit there forever with nothing to show you. Saying "in the
background" and asking for the addresses is what avoids that.

Two related traps:

- Starting **only** the website gives you a login screen where everything errors.
  That is not a bug — the backend simply is not running yet.
- "Just start everything" does not actually cover the backend, and the agent will
  come back with a confusing "no package named api" message. Name both halves
  explicitly, as the prompt above does.
:::

:::caution If the backend cannot find the database
An agent sometimes switches the backend into "container mode" to match the Docker
database, which makes it look for a database address that only exists inside
Docker. If the backend fails with an unknown-host error, say: "turn off the docker
profile and use the default settings — I am running on my own machine."
:::

## Step 4 — Add something to both halves

This is the part you actually came for. The important thing is to name **all
three layers**, because leaving one out gives you a column on screen with nothing
in it:

> **Say this**
>
> Read `apps/api/AGENTS.md` and `apps/web-admin/AGENTS.md` first, then show me
> your plan before changing anything. I want a "published" switch on articles:
> store it in the backend, include it when the list of articles is sent to the
> website, and show it as a column in the admin table. List every file you
> changed when you are done.

**What you should see:** a file list touching both halves, and the same name
appearing in all three places. Changing only one side is the usual failure here —
if the file list only mentions one half, say "you only did half of it, finish the
other side."

Two habits worth keeping:

| Habit | Why |
| ----- | --- |
| Always ask for the plan first | one sentence to correct a plan, an afternoon to unpick bad code |
| One change at a time | mixing three features into one change makes it impossible to undo just the broken one |

## Step 5 — Write it down

> **Say this**
>
> Write up how the published switch works as an internal note. Then add a page
> about it to the public documentation site and register it in the sidebar.

There are two different places for writing, and agents mix them up constantly:

| What you are writing | Where it goes |
| -------------------- | ------------- |
| Notes, plans, records for yourself and your team | `.docs/` — private, never published |
| Pages for the public to read | `docs/content/`, **and** registered in `docs/sidebars.ts` |

**What you should see:** the note in the private folder, the page in the public
one, plus a new sidebar entry. A page that is not in the sidebar does not appear
on the site at all, so ask: "which sidebar entry did you add?"

Then say: "build the documentation site and tell me if it passed." The site
deliberately refuses to build if any internal link is broken, so a clean build is
real proof rather than reassurance.

## Step 6 — Package it up for other people

> **Say this**
>
> Build the finished, release version of both halves, and tell me exactly where
> each finished file ended up.

**What you should see:** two real file paths. Ask for the actual paths — "the
build succeeded" is not something you can check, a path you can look at is.

This is the one moment where Docker legitimately builds your code, because the
person doing the packaging might have nothing installed at all. It is a shipping
step, not a shortcut for building — using it while you are still making changes
makes everything slower and errors harder to read.

## If you add another piece later

Say you come back in a month and want a desktop app alongside the website.
Enabling it is a change to the project, and the project is what decides which
programs are needed — so after enabling it, ask for the install step again:

> **Say this**
>
> Turn on the desktop app for this project, then install whatever it now needs.

**What you should see:** Rust being installed this time, and Java being left alone
because it is already there.

This is why nothing was installed up front. Back at [setup](./ai-admin-env.md)
nobody could have known you would eventually want a desktop app, so guessing would
have meant installing everything on the chance you might. Asking the project
instead means the answer stays right even when you change your mind — you just
ask for the install step again.

## Saying it well

| Instead of | Say |
| ---------- | --- |
| "Set up a project" | "Create a project with only the backend and admin website" |
| "Fix the build" | "The docs build fails. Read the error, tell me the cause, then fix it" |
| "Add a table" | "Add an article list page, following the conventions in `apps/web-admin/AGENTS.md`" |
| "Make it work" | "Start the database in Docker, then run the backend and admin website on my computer" |

The pattern is always the same: say what you want, mention the constraint, point
at the rules file, and ask for something back that you can look at.

## When it goes wrong

You do not need to diagnose anything. Find your symptom, say the sentence:

| What you see | Say this |
| ------------ | -------- |
| The install crawls forever | "Switch to the download sources for my region and try again" |
| An "access denied" database error | "The password was changed after the database was first created. Delete the database volume and start it fresh" |
| The website build fails on a different style file each time | "Check the required build setting in the top-level AGENTS.md — do not change the version pins" |
| A memory-related error you know is not memory | "This is the version pin issue described in the top-level AGENTS.md. Read that file and stop changing the pinned versions" |
| The admin site loads but everything errors | "The backend is not running. Start it in the background and tell me its address" |
| A "no package named api" message | "The backend is not part of the workspace tooling — start it its own way" |
| The backend cannot find its database host | "Turn off the docker profile and use the default settings — I am running on my own machine" |
| It has been silent for a long time | "Are you waiting on something that never finishes? Run it in the background instead" |

## Next

[Desktop App Setup](./ai-desktop-env.md) — an app that installs on a computer
rather than opening in a browser.
