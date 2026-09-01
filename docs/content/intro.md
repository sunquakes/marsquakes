---
id: intro
title: Introduction
slug: /
sidebar_position: 1
---

# Marsquakes

> An npm package that scaffolds multi-platform monorepos. Install it once, run
> `mars create`, pick the platforms you need, and you get a working repository
> with a backend API, an admin frontend, desktop and mobile clients already
> wired together by pnpm workspace + Turborepo.

```bash
pnpm add -g @marsquakes/cli
mars create my-app
```

## What you get

`mars create` does not generate a skeleton you still have to fill in. It copies
a real, running template and trims it down to the platforms you selected:

- **A working backend** — `apps/api`, Spring Boot on JDK 17, buildable with
  Maven or entirely inside Docker.
- **A working admin frontend** — `apps/web-admin`, Vue 3 + Vite, with the
  Docker and nginx configuration already written.
- **Optional extra targets** — web client, Tauri desktop app, Android, iOS,
  Windows, Linux, macOS. You choose these during `mars create`; unselected
  platforms are never copied, so the generated repository stays small.
- **Working orchestration** — `pnpm install` then `mars dev` starts every
  enabled platform in parallel. No wiring step in between.

## How the pieces fit

The generated project keeps a single source of truth, `platforms.json`, which
records every platform, its directory, its tech stack and whether it is
enabled. `mars dev`, `mars build` and `mars clean` all read that file instead of
hard-coding paths — so enabling a platform later is a configuration change, not
a refactor.

```
my-app/
├── apps/                    # only the platforms you selected
├── packages/                # shared workspace packages
├── platforms.json           # the registry every mars command reads
├── pnpm-workspace.yaml
├── turbo.json
└── AGENTS.md                # conventions, also read by AI coding agents
```

## Why a CLI instead of a template repository

Cloning a template repository gives you every platform whether you want it or
not, and it freezes you at the moment you cloned. `@marsquakes/cli` differs in
two ways:

1. **Selective generation** — you pick platforms at creation time, and the
   generated repository contains only those.
2. **`mars update`** — pulls later improvements to the build wiring
   (`turbo.json`, `platforms.json`, `packages/`, `scripts/`) into an existing
   project while leaving `apps/`, `docs/`, `.docs/` and `design/` untouched.
   Your application code is never overwritten.

## Where to go next

| Page | What it covers |
| ---- | -------------- |
| [Getting Started](./getting-started.md) | Install the CLI and create your first project |
| [CLI](./cli.md) | Full `mars` command and option reference |
| [Platforms](./platforms.md) | What each platform contains and how `platforms.json` works |
| [Docker](./docker.md) | Building and running without a local JDK or Node toolchain |
| [Conventions](./conventions.md) | Directory rules, commits, branches |

## Requirements

| Tool | Version | Needed for |
| ---- | ------- | ---------- |
| Node | >= 18 | running the `mars` CLI itself |
| pnpm | 9.15.x | installing dependencies in the generated project |

Everything else — JDK, Maven, Rust, Android SDK — is only needed for the
specific platforms you enable, and the [Docker workflow](./docker.md) can
replace most of it.

## License

The CLI and the template wiring are released under the Apache License 2.0.
Third-party code vendored under `apps/` keeps its own upstream license —
`apps/api` and `apps/web-admin` are derived from JeecgBoot, and `apps/desktop`
is a git submodule with its own `LICENSE`. Check the license file inside a
platform directory before redistributing it.

## Author

**Shing Rui** — [sunquakes@outlook.com](mailto:sunquakes@outlook.com)
