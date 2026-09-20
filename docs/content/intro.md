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

`mars create` copies a real, running template and trims it to the platforms you
selected — not a skeleton you still have to fill in:

- **A working backend** — `apps/api`, Spring Boot on JDK 17, buildable with
  Maven or entirely inside Docker.
- **A working admin frontend** — `apps/web-admin`, Vue 3 + Vite, with the
  Docker and nginx configuration already written.
- **Optional extra targets** — web client, Tauri desktop, Android, iOS, Windows,
  Linux, macOS. Unselected platforms are never copied, and their toolchains are
  never installed either.
- **Working orchestration** — `mars init` then `mars dev` starts every enabled
  platform in parallel. No wiring step in between.

One file, [`platforms.json`](./platforms.md), is the source of truth every
`mars` command reads, so enabling a platform later is a configuration change,
not a refactor:

```
my-app/
├── apps/                    # only the platforms you selected
├── packages/                # shared workspace packages
├── platforms.json           # the registry every mars command reads
├── pnpm-workspace.yaml
├── turbo.json
└── AGENTS.md                # conventions, also read by AI coding agents
```

Unlike cloning a template repository, you pick platforms up front and stay able
to run `mars update`, which pulls later build-wiring improvements into an
existing project without touching `apps/`, `docs/`, `.docs/` or `design/`.

## The journey

This track is for running every command yourself, in order:

1. **[Environment Setup](./install.md)** — install Node and pnpm (the only
   up-front requirements), then the `mars` CLI.
2. **[Start a Project](./create-project.md)** — run `mars create`, pick your
   platforms, then `mars init` installs the toolchain they imply.
3. **Build an application** — each platform has the same three pages:

   | Platform | Environment | Develop | Deploy |
   | -------- | ----------- | ------- | ------ |
   | Admin system | [Env](./guide-admin-env.md) | [Develop](./guide-admin-develop.md) | [Deploy](./guide-admin-deploy.md) |
   | Desktop | [Env](./guide-desktop-env.md) | [Develop](./guide-desktop-develop.md) | [Deploy](./guide-desktop-deploy.md) |
   | Android | [Env](./guide-android-env.md) | [Develop](./guide-android-develop.md) | [Deploy](./guide-android-deploy.md) |

4. **Reference** — look these up only when you need them:
   [CLI](./cli.md) · [Platforms](./platforms.md) · [Docker](./docker.md) ·
   [Conventions](./conventions.md).

Prefer to describe what you want and let an AI agent type the commands? Use the
**AI Guide** instead — start at its [Introduction](./ai-intro.md).

## Requirements

| Tool | Version | Needed for |
| ---- | ------- | ---------- |
| Node | >= 22.12.0 | running the `mars` CLI itself |
| pnpm | >= 9.0.0 | installing dependencies in the generated project |

Everything else — JDK, Maven, Rust, Android SDK — is only needed for the
specific platforms you enable, and you do not install it by hand:
[`mars init`](./cli.md#mars-init) derives the list from your selection and
installs it.

## License

The CLI and the template wiring are released under the Apache License 2.0.
Third-party code vendored under `apps/` keeps its own upstream license —
`apps/api` and `apps/web-admin` are derived from JeecgBoot, and `apps/desktop`
is a git submodule with its own `LICENSE`. Check the license file inside a
platform directory before redistributing it.

## Author

**Shing Rui** — [sunquakes@outlook.com](mailto:sunquakes@outlook.com)
