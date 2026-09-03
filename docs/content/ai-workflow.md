---
id: ai-workflow
title: Build a Project with AI
sidebar_position: 9
---

# Build a Project with AI

A complete walkthrough: from an empty directory to a running admin platform,
driven entirely through prompts. [Set Up the Agent](./ai-setup.md) must be done
first.

The example builds `admin-platform` — backend API plus admin frontend, nothing
else. That combination happens to be the Marsquakes default, which is what makes
it a good first run.

## The loop

Every stage below follows the same shape, and it is worth naming because it is
the difference between an agent that works and one that guesses:

1. **You state an outcome**, not a command.
2. **The agent runs commands** and shows you the output.
3. **You verify with a cheap check** — a file listing, a config read.

Skipping step 3 is how a project ends up with five platforms when you asked for
two. Every stage here ends with a verification you can run yourself.

## Stage 1 — Scaffold

> **Prompt**
>
> I want to create a new admin platform called `admin-platform` in the current
> directory. I only need the backend API and the admin frontend — no desktop,
> mobile or public web client. Use the Marsquakes CLI.

The agent should reach for:

```bash
mars create admin-platform --non-interactive
```

`--non-interactive` accepts the default selection, which is exactly `web-admin`
+ `api`. Expect:

```
✅ Selected 2 modules:
   - Web Admin
   - API Service
```

**Verify:**

```bash
ls admin-platform/apps        # api  web-admin
```

Unselected platforms are never copied, so anything else in `apps/` means the
selection did not apply.

:::tip Any other combination needs the prompt
`mars create` has no `--platform` flag. For a different platform set the agent
must answer the interactive list, toggling by the number printed next to the
label — never a hard-coded number. See
[Answering the selection prompt](./ai-agents.md#answering-the-selection-prompt).
:::

## Stage 2 — Configure

> **Prompt**
>
> Set up the environment file and install dependencies. I am on a
> mainland-China network.

```bash
cd admin-platform
cp .env.example.cn .env     # .env.example anywhere else
pnpm install
```

The two templates carry identical keys; only the npm registry and Maven mirror
URLs differ. Choosing the wrong one is not fatal, just slow — which is worth
saying out loud, because a stalled `pnpm install` looks like a hang rather than
a mirror problem.

**Verify:**

```bash
pnpm check:env              # fails loudly if the two templates have drifted
```

## Stage 3 — Bring up the database

> **Prompt**
>
> Start MySQL and Redis for this project.

```bash
docker compose -f docker-compose.infra.yml up -d
```

**Verify:**

```bash
docker compose -f docker-compose.infra.yml ps
```

:::warning Set the passwords before the first start
MySQL bakes the root password into its data volume on the **very first** boot
and ignores the variable afterwards. Editing `.env` later produces
`1045 Access denied` and the only fix is deleting the volume. Tell the agent to
fill in real passwords before this step, not after.
:::

## Stage 4 — Run

> **Prompt**
>
> Start the project. Run it in the background and tell me the URLs.

```bash
mars dev
```

:::caution `mars dev` never returns
It spawns child processes and stays in the foreground. An agent that runs it as
a blocking step will hang until it is killed. It must go into a background job,
with the URLs read from the captured output.
:::

No JDK installed? The Docker path needs no local toolchain:

```bash
mars dev --platform api --docker
```

## Stage 5 — Add a feature

This is where the `AGENTS.md` files start paying for themselves.

> **Prompt**
>
> Add a "publish" flag to the article entity in the API, expose it through the
> list endpoint, and add a column for it in the admin table.

The agent should read `apps/api/AGENTS.md` and `apps/web-admin/AGENTS.md`
before touching anything, because they define the conventions it must match —
package layout, naming, which base classes to extend.

**Verify:**

```bash
git diff --stat
```

Two habits worth enforcing in the prompt:

- **Ask for the plan first** on anything non-trivial. A wrong plan is cheap to
  correct; a wrong 400-line diff is not.
- **Keep one commit per logical change.** The root `AGENTS.md` requires English
  `<type>(<scope>): <subject>` messages, and the agent will follow it if you let
  it write the message.

## Stage 6 — Document

> **Prompt**
>
> Write up the publish-flag design, then add a page about it to the docs site.

Two destinations, and agents mix them up constantly:

| Content | Goes in |
| ------- | ------- |
| Design notes, PRDs, task records, API interface docs | `.docs/` — internal, never published |
| Pages for readers | `docs/content/`, **and** registered in `docs/sidebars.ts` |

A page that is not in `sidebars.ts` does not exist as far as the site is
concerned. That is deliberate: publishing is an explicit decision.

**Verify:**

```bash
pnpm -C docs build
```

The site is configured with `onBrokenLinks: 'throw'`, so a bad internal link
fails the build rather than shipping. Note that anchors are a separate setting
and only warn — if the agent added a `#fragment` link, check it in the built
HTML.

## Stage 7 — Ship

> **Prompt**
>
> Build release artifacts for both platforms.

```bash
mars build
```

On a clean checkout with no local JDK or Node toolchain, build inside Docker
instead:

```bash
docker compose -f docker-compose.build.yml up -d
```

The plain `docker-compose.yml` packages **already-compiled** artifacts and fails
fast if they are missing. That is the pipeline path, not the first-run path.

## Prompt patterns that work

| Instead of | Say |
| ---------- | --- |
| "Run mars create" | "Create an admin platform with only the API and admin frontend" |
| "Fix the build" | "`pnpm -C docs build` fails — read the error and fix the cause" |
| "Add a table" | "Add an article list page following the conventions in `apps/web-admin/AGENTS.md`" |
| "Make it work" | "Start the API in Docker because I have no JDK, then show me the health endpoint" |

The pattern: state the outcome, name the constraint, point at the convention
file. Command names are the agent's job.

## When the agent gets stuck

| Symptom | Likely cause |
| ------- | ------------ |
| `pnpm install` hangs | wrong `.env` template for your network — use `.env.example.cn` in mainland China |
| `1045 Access denied` from MySQL | password changed after the data volume was initialised; delete the volume |
| `vite build` fails on a different `.less` file each run | `css.preprocessorMaxWorkers` is not `0` — see the root `AGENTS.md` |
| JVM reports "Cannot create worker GC thread" | base image uses glibc ≥ 2.34; pin a `-focal` / `-bullseye` tag |
| Agent hangs forever after `mars dev` | it was run as a blocking step instead of a background job |

Next: [Automate with AI](./ai-automation.md) for scripted, non-interactive runs.
