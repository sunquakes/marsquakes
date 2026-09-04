---
id: ai-agents
title: How Vibe Coding Works Here
sidebar_position: 1
---

# How Vibe Coding Works Here

You describe what you want in ordinary sentences. The agent writes the code, runs
the tools and reports back. You never have to learn a command.

That is the whole deal, and this track is written for it. Every page gives you
something to say and tells you what you should see afterwards. If what you see
does not match, the page gives you the next thing to say.

:::tip You do not need to understand the output
Agents print a lot of text. Almost none of it is for you. The only parts that
matter are the ones this guide asks you to look for — usually a web address, a
file path, or a window opening on your screen.
:::

## The one habit worth learning

Ask for a **result you can see**, not for an action.

| Instead of saying | Say |
| ----------------- | --- |
| "Set up the project" | "Set up the project, then tell me the web address I can open" |
| "Add a products page" | "Add a products page, then list every file you changed" |
| "Build the app" | "Build the app, then tell me exactly where the installer file is" |
| "Fix it" | "It shows an error. Read the error, tell me the cause, then fix it" |

Asking for the address, the path or the file list is what lets you check the work
without reading any code. An agent that says "done" and nothing else has given
you nothing to check.

## Your first project, start to finish

> **Say this**
>
> I want to create a new project called `admin-platform`. I only need the backend
> and the admin website — no phone app, no desktop app. Set it up and tell me
> what you created.

**What you should see:** a short confirmation of the two pieces it is building.

```
✅ Selected 2 modules:
   - Web Admin
   - API Service
```

Those two are the default combination, so nothing had to be chosen by hand. Ask
one follow-up question — "which pieces did you actually create?" — and the answer
should be exactly those two and nothing else. Anything extra means it built the
wrong thing, and it is much cheaper to start over now than later.

> **Say this**
>
> Now install everything this project needs and start it running. Tell me the web
> address to open in my browser.

**What you should see:** a web address, usually starting `http://localhost:`.
Open it. That is your project running on your own machine.

Your project also already has its history saved once, automatically, before you
changed anything. So if a later experiment goes wrong you can always ask the
agent to put things back the way they were.

## Asking for a different combination

The default pair is the backend plus the admin website. Anything else — a desktop
app, for example — means the tool stops and asks which pieces you want, and the
agent has to answer that question rather than skip it.

You do not have to know how that question looks. You only have to say which
pieces you want and to name them by name:

> **Say this**
>
> I only want the desktop app — nothing else. The tool will ask you which pieces
> to include. Read its list and pick the line labelled `Desktop` by its label,
> not by guessing a number.

**What you should see:** a confirmation naming only the piece you asked for.

```
✅ Selected 1 modules:
   - Desktop
```

:::caution Say the name, never a number
The tool prints a numbered list, and those numbers move around between versions.
If you tell the agent "pick 6", it will eventually pick the wrong thing. Always
name the label you want. Some entries are marked `[developing]` — those are
unfinished and get quietly ignored if chosen.
:::

## Things you can ask for

| Say this | What you get |
| -------- | ------------ |
| "Start just the admin website" | the website opens, but every page errors until the backend runs too |
| "Start the backend" | the backend answers at `http://localhost:8080/jeecg-boot` |
| "Build everything for release" | finished files you could hand to someone else to install |
| "Update my project to the latest template" | the shared template files refresh; your own work is left alone |
| "Check what my computer is missing, then install it" | a plain list of what is missing, then the installs |
| "Start the database" | the database and cache running in the background |

## Two rules to repeat in your prompts

Agents get these two wrong more than anything else, so it is worth saying them
out loud. You do not need to know why — just paste this whenever the agent is
about to write documents or save its work:

```text
Before you start: read the AGENTS.md file nearest to whatever you are changing
and follow it. Notes and plans for me go in .docs/. Pages for the public website
go in docs/content/ and must also be added to docs/sidebars.ts. Commit messages
are in English.
```

## When something looks wrong

You will not always be able to tell what went wrong, and you do not need to. Hand
the problem back:

| What you notice | Say this |
| --------------- | -------- |
| It says "done" but you have nothing to open | "Tell me the exact web address, and the file paths you created" |
| It seems frozen with no new output | "Are you waiting on something that never finishes? Run it in the background and tell me when it is up" |
| An error you cannot read | "Read that error, explain the cause in plain language, then fix it" |
| It changed more than you expected | "List every file you changed and why. Undo anything I did not ask for" |
| You are not sure it did the right thing | "Show me your plan before you change anything else" |

:::tip Ask for the plan first
A wrong plan takes one sentence to correct. A wrong pile of code takes an
afternoon. For anything bigger than a small tweak, say "show me your plan first"
and read it before agreeing.
:::

## Next

Pick what you are building: [Admin System Setup](./ai-admin-env.md) — a website
with a login and data behind it — or [Desktop App Setup](./ai-desktop-env.md) —
an app that installs on a computer.
