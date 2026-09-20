---
id: ai-admin-module
title: Create a Feature
---

# Building an Admin System: Create a Feature

A *feature* is one management function — "manage articles", "manage orders",
"manage customers". This page adds a brand-new one to the skeleton from
[Create the Project](./ai-admin-project.md) in five prompts, each ending in a
result you can check without reading code. Every feature has the same shape: a
**database table** holding the information, a **behind-the-scenes service** that
reads and changes it, and an **admin page** with buttons. The example is
articles; swap in whatever you actually manage — the nouns change, the shape
does not.

:::tip Coming back later?
If your computer was restarted, nothing is running any more — ask the agent to
start everything the system needs and tell you when the page is ready to open.
:::

## Step 1 — Say what you are managing

Before any code, put three answers in plain language into the prompt — what one
kind of thing it manages, which fields a person fills in, and what they can do
with it (the standard actions usually suffice). A vague "make an articles
feature" leaves every decision to the agent, and it will guess differently from
you.

> **Say this**
>
> I want a new feature for managing **articles**. Before you change anything,
> read `apps/api/AGENTS.md` and `apps/web-admin/AGENTS.md`, then show me your
> plan and wait for my approval.
>
> Each article has this information:
>
> - **Title** — text, required
> - **Author** — text
> - **Summary** — a few lines of text
> - **Published** — a yes/no switch, defaults to no
> - **Publish date** — a date
>
> I need the usual management functions: a paged list with search, add, edit,
> delete, batch delete, and Excel import and export. Include the standard
> record fields (who created it and when, who last changed it and when).

**What you should see:** a written plan, not code. It should name a database
table, the behind-the-scenes pieces, the admin page and the menu entry. Read the
field list back against what you asked for — this is the cheapest moment to say
"no, I meant something else". Ask for the plan first (one sentence to correct a
plan, an afternoon to unpick bad code), and do one feature at a time.

## Step 2 — Know what a complete feature contains

You do not write these pieces, but you check they all arrived. A feature spans
**both halves**, and leaving out one layer is the usual failure:

| Layer | What it is | Where it lives |
| ----- | ---------- | -------------- |
| Data store | one row per article, one column per field | the database running in its box |
| Entity | the Java class matching that table | `apps/api/` |
| Mapper + XML | reads and writes the table | `apps/api/` |
| Service interface + implementation | the rules between the page and the table | `apps/api/` |
| Controller | the URLs the page calls: list, add, edit, delete, import, export | `apps/api/` |
| List page + form + column config + API file | the table, the add/edit dialog, and the calls they make | `apps/web-admin/` |
| Menu and button permissions | the entry in the left menu, plus who may press each button | registered as data, not code |

That is roughly six behind-the-scenes files and four website files. The
project's **code generator** produces all ten from your description, following
existing features such as position management — the agent knows to use it, so
your prompt asks only for the outcome.

> **Say this**
>
> Build this feature the project's standard way — the same way the existing
> features are built — including the admin pages, the behind-the-scenes service
> that stores the data, and the menu entry. Follow the pattern of the existing
> features; do not invent your own layout.

**What you should see:** new files in both halves, plus the file that registers
the menu (its name contains `menu_insert`). If the agent offers to "just write
everything by hand in its own style", say: "no — build it the standard way,
following the existing features' pattern."

## Step 3 — Make the menu appear and create the data

Code on its own is invisible: the admin website loads its menus from the data
store when you log in. The standard build prepares a small registration file —
one main menu plus six buttons (add, edit, delete, batch delete, export,
import), already granted to the administrator account.

> **Say this**
>
> Register the new feature so it appears in the menu and is ready to use, and
> prepare the place where its data will be kept. Tell me where in the left menu
> I will find it.

**What you should see:** the agent confirming both steps worked and naming where
in the left menu the entry will show up.

:::note Why the menu is data, not code
This admin is built in **BACK mode**: business menus are data, not entries
written into the website — which lets an administrator hand a menu or button to
a role without changing the program. The cost: copying the program to another
machine does not bring the menu; registering it does.
:::

## Step 4 — Restart, open it, and try every button

A running system only notices new code after a fresh start, and the website then
needs a page reload. Then exercise the feature the way a real user would.

> **Say this**
>
> Restart whatever needs restarting and make sure the admin website is ready.
> Then check the articles feature yourself: the menu appears, the list opens empty
> without errors, you can add an article, see it in the list, search for it, edit
> it (including flipping the published switch to yes), export the list to a
> spreadsheet, import it back, and delete one and delete several at once. Report
> each result.

**What you should see:** a checklist where every action works. Pay special
attention to the **published switch**: it has to exist in all three places (the
stored field, the data interface, the on-screen column) — a switch that renders
but never saves means the behind-the-scenes half was missed. If the reported
files touch only one half, say: "you only did half of it, finish the other
side."

## Step 5 — Write it down

> **Say this**
>
> Write up what the articles feature contains and how it was generated as an
> internal note. Then add a public page describing the new feature to the
> documentation site and register it in the sidebar.

Agents constantly mix up the two writing places:

| What you are writing | Where it goes |
| -------------------- | ------------- |
| Notes, plans, records for yourself and your team | `.docs/` — private, never published |
| Pages for the public to read | `docs/content/`, **and** registered in `docs/sidebars.ts` |

**What you should see:** the note in the private folder, the page in the public
one, plus a new sidebar entry. A page missing from the sidebar does not appear
on the site, so ask: "which sidebar entry did you add?" Then say: "build the
documentation site and tell me if it passed" — the site refuses to build on a
broken internal link, so a clean build is real proof.

When every button works and it is written down, the feature is finished. Next:
[Deploy It](./ai-admin-deploy.md).

## When it goes wrong

You do not need to diagnose anything. Find your symptom, say the sentence:

| What you see | Say this |
| ------------ | -------- |
| The menu entry is missing after the feature is built | "The menu has to be registered before it appears — register it and log in again" |
| The page opens but every request errors | "Restart whatever needs restarting so the new code is loaded, then reload the page" |
| A column shows on screen but never saves | "You missed the behind-the-scenes half — the field has to be stored and included in the data interface too" |
| The new files all sit in one half | "A feature spans both halves — build the behind-the-scenes service and the admin pages together" |
| The buttons are visible but do nothing for a non-admin account | "Give that role permission to use the six buttons — the administrator gets them automatically" |
| The list is stuck on a loading spinner | "The page cannot get its data — find the actual error in the running system's log and fix it" |
| The agent hand-wrote files in its own layout | "Throw these away and build the feature the standard way, following the existing features' pattern" |
