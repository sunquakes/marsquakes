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

A tick decides two things, not one. It selects which directories end up in your
project **and** which toolchain [`mars init`](#per-platform-toolchains) will
later check and install, so each row shows what it costs before you tick it:

```
📋 Select platforms to create

  🧰 Ticking a platform also opts into its toolchain: `mars init` checks it
     and installs what is missing. Tick nothing extra and nothing extra is
     downloaded.

  📱 Mobile:
   1. [ ] Android [developing]
         ↳ toolchain: JDK, Android CLI
   2. [ ] iOS [developing]

  🖥️ Desktop:
   3. [ ] Windows [developing]
   4. [ ] Linux [developing]
   5. [ ] macOS [developing]
   6. [ ] Desktop
         Tauri (Win / macOS / Linux)
         ↳ toolchain: Rust

  🌐 Web:
   7. [ ] Web Client [developing]
   8. [✓] Web Admin
         Backend administration system

  ⚙️ API:
   9. [✓] API Service
         RESTful API service
         ↳ toolchain: Docker, JDK, Maven

  Currently selected: 2 modules
  🧰 `mars init` will check/install: Docker, JDK, Maven
```

The summary line at the bottom updates as you toggle rows, and it is
deduplicated the way the install itself is: ticking both `api` and `android`
lists one JDK, because only one gets downloaded. Rows without a `↳ toolchain:`
line — `web`, `web-admin`, `ios`, and the platform stubs — add nothing beyond
the Node and pnpm you already have.

In an interactive terminal, move with `↑` `↓`, toggle with `space`, confirm with
`enter`. When the CLI cannot detect a TTY — a CI job, or a shell inside an
editor — it falls back to the numbered list shown above, where you type the
numbers you want to toggle, `a` for all, `n` for none, or press `enter` to
accept the defaults.

To skip the prompt entirely and take the two defaults:

```bash
mars create my-app --non-interactive
```

This ticks `web-admin` and `api` for you, so it is not a way to avoid the
install — it chooses the `api` toolchain by choosing `api`. The CLI prints the
resulting set on this path too, so the consequence is stated even though no
prompt appeared.

`create` has no `--platform` option, so any other combination must go through
the prompt. [AI Agents](./ai-agents.md) documents the prompt's input syntax and
how an agent should drive it.

## Start developing

```bash
cd my-app
mars init
mars dev
```

`mars init` is the step that acts on your ticks: it installs the workspace
dependencies and then checks and installs the toolchains your selection implies
(see [Per-platform toolchains](#per-platform-toolchains) for what that covers).
It replaces `pnpm install` rather than following it — it runs `pnpm install`
itself.

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

This table is the same mapping the selector shows as `↳ toolchain:` next to each
row when you [create a project](#create-a-project). Read it as the price list
for a tick.

| Platform | Needs on the host | Avoidable with Docker | Installed by `mars init` |
| -------- | ----------------- | --------------------- | ------------------------ |
| `api` | JDK 17 + Maven 3.9+ | yes (CI / packaging) | yes |
| `web-admin`, `web` | Node >= 22.12.0, pnpm 9.15.x | yes | already present |
| `desktop` | Rust stable + Tauri prerequisites | no | Rust yes, system libs no |
| `android` | JDK 17 + Android SDK | no | JDK yes, SDK no |
| `ios` | Xcode (macOS only) | no | no |

You do not install these up front. Run `mars init` inside the project and it works
out which ones apply:

```bash
cd my-app
mars init
```

It installs the workspace dependencies, then reads `platforms.json`, probes only
the toolchains the enabled platforms actually need, and installs the missing ones
with [mise](https://mise.jdx.dev). A web-only project therefore downloads no
language toolchain at all.

`platforms.json` holds exactly the platforms you ticked, so the ticks are what
drives this. `mars init` names their provenance as it goes, which is what lets
you trace an unexpected download back to the row that asked for it:

```
🧰 Toolchain required by this project: Docker, JDK, Maven
   (derived from: API Service)
```

If the API will only ever run in a container, say so and the host JDK and Maven
are skipped too:

```bash
mars init --docker
```

This is opt-in rather than detected, because having Docker installed does not
mean the API runs inside it — the [Docker page](./docker.md) runs MySQL and Redis
in containers while the API stays on the host, and that arrangement still needs a
host JDK. In an `api` + `android` project only Maven is skipped: Gradle runs on
the host, so the JDK is still installed.

Three things it reports instead of installing, because mise does not manage system
services, GUI applications or C libraries: **Docker**, the **Android SDK** and the
**Tauri system prerequisites**. Install mise before running `mars init` — without
it, everything above falls back to being reported rather than installed.

### Adding a platform later

Enable another platform in `platforms.json` and run `mars init` again:

```bash
mars init
```

It re-reads the file and installs whatever the new platform needs, skipping what
is already there. Re-running it is always safe, and it is the only step needed —
there is no separate "install the Rust toolchain" command to remember.

This is the practical reason the install is derived rather than done up front. An
up-front install is a snapshot: it can only be correct about the platforms that
existed on the day it ran, and nothing detects it going stale when you enable
`desktop` three months later. `mars init` describes what should be true *now*, so
the answer to "what changed?" is always the same: run it again.

### When installing everything up front is better

Three situations, and they have one thing in common — what the machine is for is
already decided, so nothing is being guessed:

| Situation | Why up front wins |
| --------- | ----------------- |
| CI runners and Docker images | The image's purpose already fixes what it builds. Toolchains baked into a layer are cached and need no network at run time — this is what the [Docker workflow](./docker.md) does |
| Offline or intranet-only machines | On-demand install assumes it can download at `mars init` time. Install while you still have connectivity |
| Uniform team or classroom machines | Identical machines are the goal, so per-machine differences are not worth preserving |

Nothing stops you from installing a JDK or Rust by hand on your own machine
either. The point is that on a laptop nobody has to decide up front, because
`platforms.json` will answer it later and more accurately.

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
