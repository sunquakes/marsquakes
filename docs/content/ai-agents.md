---
id: ai-agents
title: Using with AI Agents
sidebar_position: 7
---

# Using Marsquakes with an AI Agent

Marsquakes is usable as a tool by an AI coding agent without any extra server.
The agent needs three things, all of which already exist: a shell, the `mars`
executable, and the `AGENTS.md` files that describe the conventions.

:::info Why no MCP server
An MCP server would add a second implementation of every command, and its tool
schemas are injected into *every* session whether or not you scaffold anything.
`mars dev` also stays resident, which does not fit a request/response protocol.
A shell plus `AGENTS.md` costs nothing when unused and never drifts from the
CLI, so that is the supported path.
:::

## Prompt example: "I want a new admin platform"

This is the canonical example. The user describes an outcome; the agent picks
the commands.

> **Prompt**
>
> I want to create a new admin platform called `admin-platform`. I only need the
> backend API and the admin frontend — no desktop, mobile or public web client.
> Scaffold it and get it ready to run.

### What the agent should do

**1. Create the project.**

`api` + `web-admin` is exactly the default selection, so this prompt needs no
platform juggling at all:

```bash
mars create admin-platform --non-interactive
```

`--non-interactive` accepts the defaults and skips the prompt. If the agent runs
`mars create admin-platform` instead, it can reach the same result by sending an
empty line — see [Answering the selection prompt](#answering-the-selection-prompt)
below.

```
✅ Selected 2 modules:
   - Web Admin
   - API Service
```

**2. Configure and start.**

```bash
cd admin-platform
cp .env.example .env        # .env.example.cn on a mainland-China network
pnpm install
mars dev
```

### How to know it worked

Two checks, both cheap:

```bash
ls apps                     # api  web-admin
```

```bash
node -e "const p=require('./platforms.json').platforms;for(const c in p)for(const k in p[c])if(p[c][k].enabled)console.log(k)"
# web-admin
# api
```

Unselected platforms are never copied, so `apps/` containing anything else means
the selection did not apply.

`mars create` also runs `git init` and commits `init: create project from
template`, so the project is already a clean repository.

## Answering the selection prompt

Any combination other than the default has to go through the prompt — `create`
has no `--platform` option. An agent that pipes input has no TTY, so the CLI
falls back to the numbered list:

```
  🖥️ Desktop:
   3. [ ] Windows [developing]
   4. [ ] Linux [developing]
   5. [ ] macOS [developing]
   6. [ ] Desktop
         Tauri (Win / macOS / Linux)

  🌐 Web:
   7. [ ] Web Client [developing]
   8. [✓] Web Admin
         Backend administration system

  ⚙️ API:
   9. [✓] API Service
         RESTful API service

  Please enter selection (space-separated numbers):
```

| Input | Effect |
| ----- | ------ |
| empty line | accept the checked defaults — `web-admin` + `api` |
| `6` | **toggle** item 6, i.e. add `Desktop` for a 3-module project |
| `a` | select every selectable platform |
| `n` | select nothing |

:::caution Match the label, not the number
The numbers are a running index over the categories in `platforms.json`, so they
shift whenever a platform is added. An agent must read the printed list and pick
the number sitting next to the label it wants — never hard-code `6`. Items
marked `[developing]` are ignored silently if you toggle them.
:::

## Non-interactive runs

`--non-interactive` is the right choice **only** when the default set is what
you want:

| Goal | Command |
| ---- | ------- |
| Default platforms (`web-admin` + `api`) | `mars create my-app --non-interactive` |
| Any other combination | interactive prompt, toggle by number |

## More prompt examples

| Prompt | Commands the agent should run |
| ------ | ----------------------------- |
| "Start only the admin frontend" | `mars dev --platform web-admin` |
| "Run the API, I have no JDK installed" | `mars dev --platform api --docker` |
| "Build everything for release" | `mars build` |
| "Bring this project up to date with the template" | `mars update` |
| "Check my toolchain and install dependencies" | `mars init` |
| "Bring up MySQL and Redis" | `docker compose -f docker-compose.infra.yml up -d` |
| "Build the images on a clean checkout" | `docker compose -f docker-compose.build.yml up -d` |

## What the agent should read first

Conventions live next to the code they govern, so an agent should read the
`AGENTS.md` closest to whatever it is about to change:

| File | Governs |
| ---- | ------- |
| `AGENTS.md` (root) | Directory rules, Docker layout, base-image constraints, commit format |
| `apps/api/AGENTS.md` | Backend conventions |
| `apps/web-admin/AGENTS.md` | Admin frontend conventions |
| `docs/AGENTS.md` | The documentation site |

Two rules from the root file are worth repeating, because they are the ones an
agent most often gets wrong:

- Design documents, PRDs and task notes go in `.docs/`. Published pages go in
  `docs/content/` **and** must be registered in `docs/sidebars.ts`.
- Commit messages are English, `<type>(<scope>): <subject>`.

## Known rough edges

The CLI is built for humans first. When wiring it into automation, expect:

- **Human-readable output only.** There is no `--json` flag; results have to be
  parsed from prose, or inferred from `platforms.json` and `apps/` as shown
  above.
- **Coarse exit codes.** Failures exit `1` regardless of cause, so a usage error
  and a missing toolchain look identical to a caller.
- **`mars dev` does not return.** It spawns child processes and stays in the
  foreground. Run it in a background job, never as a blocking step.

## Next

[Set Up the Agent](./ai-setup.md) — install and configure OpenAI Codex CLI,
then walk through [Build a Project with AI](./ai-workflow.md).
