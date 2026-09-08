---
id: ai-desktop-prompts
title: Desktop App Prompts
sidebar_position: 2
---

# Building a Desktop App

Six things to say, in order. At the end you have an installer file you can send to
someone, and they can double-click it.

A desktop app is one single thing, not a matching pair. There is no separate
backend to start, no database to run, and nothing to open in a browser — the app
is a window on your screen.

:::tip Do the setup page first
This page assumes your computer is already prepared — see
[Desktop App Setup](./ai-desktop-env.md).
:::

## Step 1 — Create the project

> **Say this**
>
> Create a new desktop app called `my-desktop` in this folder. I only want the
> desktop app — no backend, no admin website, no phone app, no public website. The
> tool will stop and ask which pieces to create: read the list it prints and pick
> the line that says `Desktop`.

Unlike the admin system, this combination is not the default, so the tool stops and
asks you a question. The agent has to actually answer it.

**What you should see:** a confirmation of exactly one piece.

```
✅ Selected 1 modules:
   - Desktop
```

Then ask: "which pieces did you actually create?" The answer should be just the
desktop app. If anything else showed up, the agent skipped the question instead of
answering it — say "delete it and do it again, and this time answer the selection
question."

:::caution Say the name, never a number
The list is numbered, but the numbers move around as the list changes, so a number
you were told once will eventually point at the wrong thing. Always tell the agent
to read the list and pick the line labelled `Desktop`.
:::

## Step 2 — Install what the project needs

> **Say this**
>
> Set up the environment file and install everything this project needs. I am in
> mainland China.

Mentioning where you are matters. Downloads come from different places depending on
your country, and picking the wrong one turns a short install into a very long one.

**What you should see:** a settings file at the top of your project, and an install
that finishes without errors.

This is also where Rust arrives, if it was not already on your computer. It was
skipped during [setup](./ai-desktop-env.md#what-ready-should-look-like) on purpose
— nothing knew you wanted a desktop app until Step 1 created one. The project now
says so, so the tool works it out and installs it without being asked.

Then ask: "is the desktop app's own code folder there?" If the agent says it is
missing, the app was never created and you need to go back to step 1.

There is no database step here. The app stores its data in a file it creates the
first time it runs.

## Step 3 — Start it and look at it

> **Say this**
>
> Start the desktop app in development mode, in the background, and tell me when
> the window should be open.

**What you should see:** an actual window opening on your screen. That window is
the app. From now on, when you ask for a change, the window updates by itself
within a few seconds — you do not restart anything.

:::caution Say "in the background", or the agent will appear to freeze
The app keeps running until you close it, so an agent that starts it as a normal
step will sit there forever with nothing to say. Asking for it in the background is
what avoids that.
:::

:::note A blank white window is not a crash
It means the app started but the part that draws the screen is not running yet.
Say: "the window is blank — is the development server actually running?"
:::

## Step 4 — Add a feature

This is the part you actually came for. The important thing is to name **all three
layers**, because leaving one out gives you a screen with nothing behind it — the
data layer that stores things, the connecting layer, and the screen you look at.

You do not have to know what those layers are called. The project writes its own
instructions down, so point the agent at them instead:

> **Say this**
>
> Read `apps/desktop/AGENTS.md` first and follow the step-by-step workflow in it,
> then show me your plan before changing anything. I want a product management
> screen: I should be able to add, edit and delete products, and it should work in
> both languages. List every file you changed when you are done.

**What you should see:** roughly ten changed files. If the list has fewer than six,
something was skipped — say "you missed a layer, check the workflow file again and
finish it."

:::caution The failure that looks like it worked
The most common miss is a connection the app never registers. Nothing complains
while it is being built, and the mistake only shows up as an error the moment you
click the button. So always click the thing you just asked for. If it errors, say:
"the screen is there but the action fails — you added the code without connecting
it up."
:::

Two habits worth keeping:

| Habit | Why |
| ----- | --- |
| Always ask for the plan first | one sentence to correct a plan, an afternoon to unpick bad code |
| One change at a time | mixing three features into one change makes it impossible to undo just the broken one |

## Step 5 — Write it down

> **Say this**
>
> Write up how the product screen works as an internal note.

**What you should see:** the note under `.docs/`. That folder is private and is
never published anywhere.

If it lands in `docs/content/` instead, the agent just put your private notes on a
public website. Say: "move that file to `.docs/` — it is not for the public site."

## Step 6 — Package it up for other people

> **Say this**
>
> Build the finished, release version of the desktop app, and tell me exactly where
> the installer file ended up.

**What you should see:** one real file path, ending in the kind of installer your
computer uses — `.msi` or `.exe` on Windows, `.dmg` on macOS, `.deb` or
`.AppImage` on Linux. Ask for the actual path: "the build succeeded" is not
something you can check, a file you can look at is.

That file is the thing you send to someone. They do not need any of the programs you
installed.

:::note There is no shortcut for this one
Unlike the admin system, this app cannot be packaged inside Docker — it has to be
built on a real computer, and on the same kind of computer as the people you are
sending it to. If an agent starts looking for a Docker way to do it, say: "there
is no Docker path for the desktop app, build it directly."
:::

## If you add another piece later

Say you come back in a month and want a backend as well, so the app can store
things somewhere other than the one computer it runs on. Enabling it is a change
to the project, and the project is what decides which programs are needed — so
after enabling it, ask for the install step again:

> **Say this**
>
> Turn on the backend for this project, then install whatever it now needs.

**What you should see:** Java and Maven being installed this time, and Rust being
left alone because it is already there.

This is why nothing was installed up front. Back at [setup](./ai-desktop-env.md)
nobody could have known you would eventually want a backend, so guessing would
have meant installing everything on the chance you might. Asking the project
instead means the answer stays right even when you change your mind — you just
ask for the install step again.

## Saying it well

| Instead of | Say |
| ---------- | --- |
| "Set up a desktop project" | "Create a project with only the desktop app — answer the selection question and pick Desktop" |
| "Start the app" | "Start the desktop app in the background and tell me when the window is open" |
| "Add a products page" | "Add a product screen, following the step-by-step workflow in `apps/desktop/AGENTS.md`" |
| "Build it" | "Build the release version — I need an installer file, tell me its exact path" |

The pattern is always the same: say what you want, mention the constraint, point at
the rules file, and ask for something back that you can look at.

## When it goes wrong

You do not need to diagnose anything. Find your symptom, say the sentence:

| What you see | Say this |
| ------------ | -------- |
| Extra pieces were created, not just the desktop app | "You skipped the selection question. Delete it and do it again, answering the list" |
| A "command not found" error when starting the app | "Open a new terminal window and try again — this one has stale information" |
| The window opens completely blank | "The window is blank — is the development server actually running?" |
| A screen appears but its buttons error | "You added the code without connecting it up. Register it properly" |
| The build fails on a different style file each time | "Check the required build setting in the top-level AGENTS.md — do not change the version pins" |
| The agent has been silent for a long time | "Are you waiting on something that never finishes? Run it in the background instead" |
| The agent starts looking for a Docker way to build | "There is no Docker path for the desktop app, build it directly" |
