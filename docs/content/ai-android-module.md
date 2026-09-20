---
id: ai-android-module
title: Create a Feature
---

# Building an Android App: Create a Feature

Two prompts. This is where the app that only opens in
[Create the Project](./ai-android-project.md) becomes one that *does* something.

:::tip Coming back later?
If the computer was restarted, reconnect the phone or restart the emulator
first — a change is only visible after it is installed on a device.
:::

## Step 1 — Add a feature

This is the part you came for. Name **all three layers** — the data layer that
stores things, the connecting layer, and the screen you look at. Leave one out
and you get a screen with nothing behind it.

You do not have to know what those layers are called. The project writes its own
instructions down, so point the agent at them instead:

> **Say this**
>
> Read `apps/android/AGENTS.md` first and follow the conventions in it, then show
> me your plan before changing anything. I want a product management screen: I
> should be able to add, edit and delete products, and it should work in both
> languages. List every file you changed when you are done.

**What you should see:** roughly ten changed files. If the list has fewer than six,
something was skipped — say "you missed a layer, check the conventions file again
and finish it."

Open the app on the device and try the new action yourself. A screen that renders
but errors the moment you press its button is the usual sign of a half-wired
layer.

Two habits worth keeping:

| Habit | Why |
| ----- | --- |
| Always ask for the plan first | one sentence to correct a plan, an afternoon to unpick bad code |
| One change at a time | mixing three features into one change makes it impossible to undo just the broken one |

## Step 2 — Write it down

> **Say this**
>
> Write up how the product screen works as an internal note.

**What you should see:** the note under `.docs/`. That folder is private and is
never published anywhere.

If it lands in `docs/content/` instead, the agent just put your private notes on a
public website. Say: "move that file to `.docs/` — it is not for the public site."

When the feature works and is written down, the app is finished. Next:
[Package It](./ai-android-deploy.md).
