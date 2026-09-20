---
id: ai-agents
title: How Vibe Coding Works Here
sidebar_position: 3
---

# How Vibe Coding Works Here

You describe what you want in ordinary sentences. The agent writes the code, runs
the tools and reports back. You never type a command or read code — every page
gives you something to say, then tells you what you should see.

:::tip You do not need to understand the output
Almost none of the text agents print is for you. Look only for what this guide
points at — usually a web address, a file path, or a window opening.
:::

## The one habit worth learning

Ask for a **result you can see**, not for an action.

| Instead of saying | Say |
| ----------------- | --- |
| "Set up the project" | "Set up the project, then tell me the web address I can open" |
| "Add a products page" | "Add a products page, then list every file you changed" |
| "Build the app" | "Build the app, then tell me exactly where the installer file is" |
| "Fix it" | "It shows an error. Read the error, tell me the cause, then fix it" |

The address, path or file list is what lets you check the work. An agent that
says "done" and nothing else has given you nothing to check.

### Platform-specific examples

| Instead of | Say |
| ---------- | --- |
| "Set up a project" | "Create a project containing only the website-based management system" |
| "Fix the build" | "The docs build fails. Read the error, tell me the cause, then fix it" |
| "Add a table" | "Add an article list page, following the conventions in `apps/web-admin/AGENTS.md`" |
| "Make it work" | "Start everything the management system needs, the standard way, and tell me when the page is ready to open" |
| "Set up a desktop project" | "Create a project with only the desktop app — answer the selection question and pick Desktop" |
| "Start the app" | "Start the desktop app and tell me when the window is open" |
| "Add a products page" | "Add a product screen, following the step-by-step workflow in `apps/desktop/AGENTS.md`" |
| "Build it" | "Build the release version — I need an installer file, tell me its exact path" |
| "Set up an Android project" | "Create a project with only the Android app — answer the selection question and pick Android" |
| "Put it on my phone" | "Install the app on the phone I have plugged in, and tell me when it is on there" |

Same pattern every time: say what you want, name the constraint, point at the
rules file, and ask for something you can look at.

## Your first project, start to finish

> **Say this**
>
> I want to create a new project called `admin-platform`. I only need the
> website-based management system — no phone app, no desktop app. Set it up and
> tell me what you created.

**What you should see:** a short confirmation of the two pieces it is building.

```
✅ Selected 2 modules:
   - Web Admin
   - API Service
```

Those two are the default combination. Follow up once — "which pieces did you
actually create?" — and the answer should be exactly those two. Anything extra
means it built the wrong thing; restarting now is much cheaper than later.

> **Say this**
>
> Now install everything this project needs and start it running. Tell me the web
> address to open in my browser.

**What you should see:** a web address, usually starting `http://localhost:`.
Open it — that is your project running on your own machine.

Your project's history is saved once automatically before you change anything, so
if a later experiment goes wrong you can always ask the agent to restore it.

## Asking for a different combination

The default pair is the backend plus the admin website. Anything else makes the
tool stop and ask which pieces you want — the agent must answer that question, not
skip it. You only have to name the pieces:

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
The numbers in the printed list move between versions, so "pick 6" eventually
picks the wrong thing — always name the label. Entries marked `[developing]` are
unfinished and get quietly ignored if chosen.
:::

## Things you can ask for

| Say this | What you get |
| -------- | ------------ |
| "Start just the admin website" | the website opens, but every page errors until the whole system is running |
| "Start the whole system" | everything the website needs is up, and the login page opens |
| "Build everything for release" | finished files you could hand to someone else to install |
| "Update my project to the latest template" | the shared template files refresh; your own work is left alone |
| "Check what my computer is missing, then install it" | a plain list of what is missing, then the installs |
| "Start everything the system needs" | its data store and cache are started the standard way, with nothing for you to choose |

## Two rules to repeat in your prompts

Agents get these two wrong more than anything else. Paste this whenever the agent
is about to write documents or save its work:

```text
Before you start: read the AGENTS.md file nearest to whatever you are changing
and follow it. Notes and plans for me go in .docs/. Pages for the public website
go in docs/content/ and must also be added to docs/sidebars.ts. Commit messages
are in English.
```

## When something looks wrong

You do not need to diagnose it. Hand the problem back:

| What you notice | Say this |
| --------------- | -------- |
| It says "done" but you have nothing to open | "Tell me the exact web address, and the file paths you created" |
| It seems frozen with no new output | "Are you waiting on something that never finishes? Start it the way that lets you keep talking to me, and tell me when it is up" |
| An error you cannot read | "Read that error, explain the cause in plain language, then fix it" |
| It changed more than you expected | "List every file you changed and why. Undo anything I did not ask for" |
| You are not sure it did the right thing | "Show me your plan before you change anything else" |

:::tip Ask for the plan first
A wrong plan takes one sentence to correct. A wrong pile of code takes an
afternoon. For anything bigger than a small tweak, say "show me your plan first"
and read it before agreeing.
:::

## Next

[Start a Project](./ai-start.md) — pick what you want to build and get set up
in one go.
