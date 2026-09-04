---
id: getting-started
title: Getting Started
sidebar_position: 2
---

# Getting Started

## Install the CLI

```bash
pnpm add -g @marsquakes/cli
```

The package is named `@marsquakes/cli`, but the command it installs is `mars`:

```bash
mars --help
```

:::tip
Prefer not to install globally? `pnpm dlx @marsquakes/cli create my-app` works
too, and always fetches the latest version.
:::

Node >= 22.12.0 and pnpm >= 9 are the only requirements. If pnpm is missing, enable
it through the Corepack shim that ships with Node:

```bash
corepack enable pnpm
```

## Create a project

```bash
mars create my-app
```

You will be asked which platforms to include. `web-admin` and `api`
are pre-selected; everything else is opt-in.

```
📋 Select platforms to create

  📱 Mobile:
   1. [ ] Android [developing]
   2. [ ] iOS [developing]

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
```

In an interactive terminal, move with `↑` `↓`, toggle with `space`, confirm with
`enter`. When the CLI cannot detect a TTY — a CI job, or a shell inside an
editor — it falls back to the numbered list shown above, where you type the
numbers you want to toggle, `a` for all, `n` for none, or press `enter` to
accept the defaults.

To skip the prompt entirely and take the two defaults:

```bash
mars create my-app --non-interactive
```

`create` has no `--platform` option, so any other combination must go through
the prompt. [AI Agents](./ai-agents.md) documents the prompt's input syntax and
how an agent should drive it.

## Start developing

```bash
cd my-app
pnpm install
mars dev
```

`mars dev` reads `platforms.json` and starts every enabled platform in
parallel. To focus on one:

```bash
mars dev --platform web-admin
```

To run the API you need Maven on the host — the `api` is a Maven module, not a
pnpm workspace member, so it is not covered by `mars dev`:

```bash
cd apps/api && mvn -pl jeecg-module-system/jeecg-system-start -am spring-boot:run
```

MySQL and Redis are expected on `127.0.0.1:3306` / `127.0.0.1:6379` — start them
with `docker compose -f docker-compose.infra.yml up -d`.

## Build

```bash
mars build                          # every enabled platform
mars build --platform web-admin
mars build --platform api --docker
```

## Per-platform toolchains

The CLI itself only needs Node and pnpm. Each platform you enable adds its own
requirement — but only when you build it **on the host**. The
[Docker workflow](./docker.md) removes most of these for CI and packaging.

| Platform | Needs on the host | Avoidable with Docker |
| -------- | ----------------- | --------------------- |
| `api` | JDK 17 + Maven 3.9+ | yes (CI / packaging) |
| `web-admin`, `web` | Node >= 22.12.0, pnpm 9.15.x | yes |
| `desktop` | Rust stable + Tauri prerequisites | no |
| `android` | JDK 17 + Android SDK | no |
| `ios` | Xcode (macOS only) | no |

Run `mars init` inside a generated project to install dependencies and report
which of these are missing.

## Updating an existing project

Improvements to the build wiring can be pulled into a project you created
earlier:

```bash
cd my-app
mars update
```

This refreshes `AGENTS.md`, `turbo.json`, `pnpm-workspace.yaml`,
`platforms.json`, `package.json`, `scripts/` and `packages/`. It deliberately
**skips** `apps/`, `docs/`, `.docs/` and `design/`, so your application code and
documents are never touched. A backup of the replaced files is written to
`.mars-update-backup` before anything changes.

## Using a different template

`mars create` defaults to the official template, but you can point it anywhere:

```bash
mars create my-app --template https://github.com/you/your-template.git
mars create my-app --from ../local-template
```

`--from` is also how you test changes to the template without publishing
anything.

## Output language

Every command accepts `--lang`:

```bash
mars create my-app --lang zh
```

Only `en` (default) and `zh` are supported.
