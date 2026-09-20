---
id: ai-admin-project
title: Create the Project
---

# Building an Admin System: Create the Project

Three prompts in order, each ending in something you can see — you never read
code. Your computer is already prepared — see [Start a Project](./ai-start.md).

An admin system is a **matching pair**: the website and the backend holding its
data. Ask for them separately and you get two strangers, so every prompt treats
both as one thing.

## Step 1 — Create the project

> **Say this**
>
> Create a new project called `admin-platform` in this folder for the
> website-based management system only — no phone app, no desktop app, no public
> website. Use the Marsquakes tool to create it.

**What you should see:** a confirmation of exactly two pieces.

```
✅ Selected 2 modules:
   - Web Admin
   - API Service
```

Then ask "which pieces did you actually create?" — it should name only those
two. Anything else means the wrong thing was built; say "delete it and do it
again with only those two". (Every other combination — even a
[desktop app](./ai-desktop-project.md) — makes the tool stop and ask; this pair
is the default.)

## Step 2 — Install what the project needs

:::note Creating a project installs nothing
Step 1 only copies files and initializes Git — its final message prints
`mars init` as your next command. Until then there are no dependencies, no Java
or Maven and no `.env`, so neither half can start; the split also keeps project
creation working offline. Do not skip this because Step 1 "looked finished".
:::

> **Say this**
>
> Install everything this project needs and apply the settings it normally asks
> for. I am in mainland China, so use the download sources for that network.
> Put the data-store passwords in place before anything starts up for the first
> time.

Where you are matters: the wrong download source turns two minutes into twenty.

**What you should see:** a settings file at the top of the project with the
passwords filled in, and an install that finishes without errors. Java and Maven
also arrive here if they were missing — deliberately skipped at
[setup](./ai-start.md#what-ready-should-look-like), because nothing knew you
wanted a backend until Step 1 created one.

:::caution "Java works but something says JAVA_HOME is not set"
Not broken — the terminal was opened before Java finished installing. Say:
"open a fresh terminal and check again before you reinstall anything."
Reinstalling Java will not help.
:::

:::note An install that crawls is not an install that failed
It is almost always downloading from the wrong side of the world. Say: "switch
to the download sources for my region and try again." Do not wait it out.
:::

## Step 3 — Start it and open it

The agent uses the convenient **standard setup**, with no decisions from you:
the data store runs in a box on your computer — Docker was already part of the
ready computer the setup page left you with — and the system itself runs on your
computer so edits take effect immediately. You only ever look at the website.

> **Say this**
>
> Start the whole system the standard way and tell me the address of the page I
> should open. Keep everything running while we work, and let me know when it is
> ready.

**What you should see:** the agent naming an address starting with
`http://localhost`, and a login page appearing there. That one page is
everything you open — the data store and behind-the-scenes service start quietly
with it and stay in the background so the agent can keep talking. The first
start is slower, because the empty data store has to be filled first.

:::note When the page opens before it is truly ready
Login failing or every page erroring on the first run means the service has not
finished starting. Wait and refresh; if it keeps happening, say: "something did
not finish starting — check it and tell me when it is ready."
:::

:::note When the website cannot find its data
An agent occasionally boxes the whole system, and the two halves then cannot
find each other by their usual names. Say: "use the standard local setup — data
store in its box, system running normally on my computer."
:::

When the login page opens, the skeleton is done. Log in with `admin` / `123456`.
Next: [Create a Feature](./ai-admin-module.md).

## When it goes wrong

You do not need to diagnose anything. Find your symptom, say the sentence:

| What you see | Say this |
| ------------ | -------- |
| The install crawls forever | "Switch to the download sources for my region and try again" |
| An "access denied" database error | "The password was changed after the database was first created. Delete the database volume and start it fresh" |
| The admin site loads but everything errors | "Something did not finish starting — start the whole system the standard way and tell me when the page works" |
| A "no package named api" message | "Start the behind-the-scenes service its own way — it is not part of the website tooling" |
| The website cannot find its data | "Use the standard local setup — data store in its box, system running normally on my computer" |
| It has been silent for a long time | "Are you waiting on something that never finishes? Start it the way that lets you keep talking to me, and tell me when it is up" |
