---
id: ai-setup
title: Set Up the Agent
sidebar_position: 8
---

# Set Up the Agent — OpenAI Codex CLI

[Using with AI Agents](./ai-agents.md) explains *why* Marsquakes is driven
through a shell instead of an MCP server. This page installs the agent that
does the driving.

:::note One tool per language
The English documentation uses **OpenAI Codex CLI**. The Chinese documentation
covers **DeepSeek Harness (`dsh`)** instead. The two tracks are deliberately not
translations of each other — pick whichever agent you actually run. Everything
downstream (`mars`, `AGENTS.md`, the verification commands) is identical either
way, because the agent only ever talks to Marsquakes through a shell.
:::

## Install

```bash
npm i -g @openai/codex
```

Homebrew works too:

```bash
brew install codex
```

Then authenticate and confirm the install:

```bash
codex login
codex doctor
```

`codex doctor` prints the resolved version, config path and sandbox support. Run
it before filing any bug report — most "Codex is broken" reports are a config
file that never loaded.

## Configure

Codex reads TOML from two places:

| File | Scope |
| ---- | ----- |
| `~/.codex/config.toml` | your user-wide defaults |
| `.codex/config.toml` | per-project override, honoured only in trusted projects |

Settings resolve in this order, first match wins:

1. CLI flags (`-c key=value`, `-m`, `-s`, `-a`, …)
2. project config
3. the active profile (`-p`/`--profile`)
4. user config
5. system config
6. built-in defaults

A reasonable user-wide starting point for Marsquakes work:

```toml
# ~/.codex/config.toml
approval_policy = "on-request"
sandbox_mode = "workspace-write"

[sandbox_workspace_write]
network_access = true
```

Why those three:

- `approval_policy = "on-request"` lets the agent run read-only commands freely
  and ask before anything that writes. `untrusted` asks about nearly everything
  and makes scaffolding tedious; `never` removes the safety net entirely.
- `sandbox_mode = "workspace-write"` confines writes to the working directory.
  `mars create my-app` writes inside the current directory, so this is enough.
- `network_access = true` is **required** here. `mars create` runs `git init`,
  and the very next step is `pnpm install`, which cannot work offline. Without
  it the agent will report a mysterious registry timeout.

:::warning `--yolo` disables the sandbox
`--yolo` is shorthand for full access with no approvals. It is convenient in a
throwaway container and a bad idea on your own machine, where `mars` is about to
run `git init` and a package manager.
:::

### Profiles

Named profiles avoid editing the file every time you switch between scaffolding
and code review:

```toml
[profiles.scaffold]
approval_policy = "on-request"
sandbox_mode = "workspace-write"

[profiles.review]
approval_policy = "untrusted"
sandbox_mode = "read-only"
```

```bash
codex -p scaffold
```

## Why `AGENTS.md` matters here

Codex reads `AGENTS.md` from the repository automatically. Marsquakes already
ships that file at the root and next to each platform, which is the entire
reason no extra integration is needed:

| File | Governs |
| ---- | ------- |
| `AGENTS.md` (root) | Directory rules, Docker layout, base-image constraints, commit format |
| `apps/api/AGENTS.md` | Backend conventions |
| `apps/web-admin/AGENTS.md` | Admin frontend conventions |
| `docs/AGENTS.md` | The documentation site |

A generated project inherits all of them, so the agent knows — without being
told in the prompt — that design notes belong in `.docs/`, that published pages
must be registered in `docs/sidebars.ts`, and that commit messages are English
`<type>(<scope>): <subject>`.

## Start in the right directory

Codex treats the directory it was launched from as the workspace root, and
`sandbox_mode = "workspace-write"` is scoped to that root. Two consequences:

```bash
cd ~/projects          # scaffolding: start in the PARENT of the new project
codex
```

```bash
cd ~/projects/admin-platform    # working on an existing project
codex
```

If you are already elsewhere, move the root instead of restarting:

```bash
codex -C ~/projects/admin-platform
```

`--add-dir` grants access to an extra directory without changing the root —
useful when a shared template lives outside the project.

## Verify the setup

Ask for something read-only first. If this works, the shell, the sandbox and the
`AGENTS.md` pickup are all fine:

> **Prompt**
>
> Run `mars --version` and tell me which platforms `platforms.json` enables.

Now continue to [Build a Project with AI](./ai-workflow.md).
