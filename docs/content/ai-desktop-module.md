---
id: ai-desktop-module
title: Create a Feature
---

# Building a Desktop App: Create a Feature

Two things to say. This is where the empty window from
[Create the Project](./ai-desktop-project.md) becomes an app that *does*
something.

:::tip Coming back later?
If your computer was restarted, nothing is running any more — ask the agent to
start the app again and tell you when the window should be open.
:::

## Step 1 — Add a feature

Name **all three layers** — the data layer that stores things, the connecting
layer, and the screen you look at. Leave one out and you get a screen with
nothing behind it.

You do not need to know the layer names: the project wrote its own instructions
down, so point the agent at them:

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
The most common miss is a connection the app never registers: nothing complains
while it is built — the error appears only when you click the button. So always
click what you just asked for. If it errors, say: "the screen is there but the
action fails — you added the code without connecting it up."
:::

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
[Package It](./ai-desktop-deploy.md).

## When it goes wrong

| What you see | Say this |
| ------------ | -------- |
| A screen appears but its buttons error | "You added the code without connecting it up. Register it properly" |

