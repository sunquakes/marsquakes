---
id: cli
title: CLI Reference
sidebar_position: 3
---

# `mars` CLI Reference

The npm package is named **`@marsquakes/cli`**; the executable it installs is
**`mars`**.

```bash
pnpm add -g @marsquakes/cli
mars <command> [options]
```

## Commands

| Command | Description |
| ------- | ----------- |
| `create <project-name>` | Create a new project from a template |
| `update` | Update build wiring from the template, keeping `apps/`, `docs/`, `.docs/`, `design/` |
| `dev` | Start development (default: all enabled platforms) |
| `build` | Build (default: all enabled platforms) |
| `init` | Install dependencies, then check and install the toolchain your selection implies |
| `clean` | Remove all build artifacts |

Every command except `create` must be run **inside** a generated project. The
CLI locates the project root by walking up from the current directory looking
for `package.json`, `AGENTS.md` or `turbo.json`.

## Options

| Option | Applies to | Description |
| ------ | ---------- | ----------- |
| `--template <url>` | `create` | Use a git repository as the template |
| `--from <path>` | `create` | Use a local directory as the template |
| `-n`, `--non-interactive` | `create` | Accept the default platform selection |
| `--platform <platform>` | `dev`, `build` | Limit to one platform |
| `--docker` | `dev`, `build` | Run inside a Docker container |
| `--lang <en\|zh>` | all | Output language (default `en`) |
| `--help` | all | Show help |

## `mars create`

```bash
mars create my-app
mars create my-app --non-interactive
mars create my-app --template https://github.com/you/template.git
mars create my-app --from ../local-template
```

### Template resolution

The CLI picks a template source in this order, stopping at the first match:

1. `--from <path>` — a local directory.
2. `--template <url>` — a git repository, shallow-cloned.
3. **The current directory**, if it looks like a Marsquakes project. This
   requires *all three* of `package.json`, `AGENTS.md` and `turbo.json` to be
   present — a stricter test than the project-root lookup used by other
   commands, precisely so that running `mars create` in an unrelated folder does
   not silently copy it.
4. The official template,
   `https://github.com/sunquakes/marsquakes.git`.

### Platform selection

| Platform | Category | Pre-selected | Selectable | Toolchain a tick pulls in |
| -------- | -------- | ------------ | ---------- | ------------------------- |
| `web-admin` | web | yes | yes | — |
| `api` | api | yes | yes | Docker, JDK, Maven |
| `desktop` | desktop | no | yes | Rust |
| `web` | web | no | no | — |
| `android` | mobile | no | no | JDK, Android CLI |
| `ios` | mobile | no | no | — |
| `windows` | desktop | no | no | — |
| `linux` | desktop | no | no | — |
| `macos` | desktop | no | no | — |

The last column is the part that outlives `create`. A tick decides which
`apps/<name>` directory is copied **and** what [`mars init`](#mars-init) will
later probe and install on your machine, so the selector prints that column next
to every row as `↳ toolchain:` before you commit to it. An empty cell means the
platform needs nothing beyond the Node and pnpm you already have — either
because it builds with the base tools (`web`, `web-admin`) or because it builds
with an OS toolchain that no version manager can install (`ios` needs Xcode,
`windows` MSVC, `linux` gcc).

**Pre-selected** and **selectable** are separate keys in `platforms.json`:
`enabled` controls whether the entry can be picked at all (a `false` entry is
greyed out and labelled `[developing]`), while the optional `default` key
controls whether it starts checked. `desktop` is the one platform where they
differ — it is a complete Tauri app you can opt into, just not part of the
default project. Omit `default` and it falls back to `enabled`.

`--non-interactive` selects exactly the two pre-selected platforms. There is
**no `--platform` option on `create`**, so any other combination has to go
through the prompt. See [AI Agents](./ai-agents.md) for the prompt's input
syntax.

Because `api` is one of those two, the default project asks for Docker, a JDK
and Maven — `-n` is a way to skip the *prompt*, not a way to skip the install.
The CLI prints the resulting toolchain set on this path too, so the consequence
is still stated even though nothing was displayed to tick.

Unselected platforms are never copied into the new project — the directory is
skipped entirely rather than copied and deleted.

### What `create` does

1. Resolves the template and copies everything **except** `apps/`.
2. Copies only the `apps/<name>` directories you selected.
3. Rewrites `platforms.json` so `enabled` matches your selection. This is also
   what makes the selection outlive `create`: every later command, `mars init`
   included, re-derives its work from that file rather than from a record of
   what you ticked.
4. Replaces the project name across the generated files (`package.json`,
   `AGENTS.md`, `platforms.json`, compose files and others).
5. Deletes the template's `.git`, initialises a fresh repository and creates an
   `init: create project from template` commit.

It then prints the three commands you need next:

```bash
cd my-app
mars init
mars dev
```

`mars init` rather than `pnpm install`, because installing the npm dependencies
is only the first half of what your ticks implied — see below.

## `mars update`

```bash
cd my-app
mars update
```

Refreshes only the build wiring:

| Updated | Never touched |
| ------- | ------------- |
| `AGENTS.md` | `apps/` |
| `turbo.json` | `docs/` |
| `pnpm-workspace.yaml` | `.docs/` |
| `platforms.json` | `design/` |
| `package.json` | |
| `scripts/`, `packages/` | |

Replaced files are backed up to `.mars-update-backup` first.

## `mars dev`

```bash
mars dev                            # all enabled platforms, in parallel
mars dev --platform web-admin
```

Web workspaces are started through Turborepo. Native platforms are started
through their own toolchain — currently only `android` has a wired script
(`gradlew installDebug`); `ios`, `windows`, `linux` and `macos` print a
"pending" notice when started natively.

`api` has no wired `dev` script and is **not** a pnpm workspace member, so it is
not covered by `mars dev`. Run it with Maven on the host instead:

```bash
cd apps/api && mvn -pl jeecg-module-system/jeecg-system-start -am spring-boot:run
```

## `mars build`

```bash
mars build
mars build --platform web-admin
mars build --platform api --docker
```

`build` is implemented for `web`, `web-admin`, `desktop` and `android`. Other
platforms report that building is not supported yet.

## `mars init`

```bash
mars init            # dependencies + the toolchain your selection implies
mars init --docker   # same, but the API runs in a container
```

This is where a tick made during `create` is paid for. `init` reads
`platforms.json`, takes the union of the toolchains its enabled platforms need,
and works through them in order:

1. Verifies pnpm is present, then runs `pnpm install` for the workspace. You do
   not run `pnpm install` yourself — `init` replaces it rather than following it.
2. Runs `gradlew --version` if `android` is enabled, to prime the Gradle wrapper.
3. Reports the set it derived, naming where each entry came from:

   ```
   🧰 Toolchain required by this project: Docker, JDK, Maven
      (derived from: API Service)
   ```

4. Probes each tool and prints one line per result — `✅` with the version, `⚠️`
   if it is older than the floor, `❌` if it is missing.
5. Installs only what came back not-`ok`, by one of three routes.
6. Installs the Android SDK packages if `android` is enabled, deriving them from
   `compileSdk` and writing `sdk.dir` into `local.properties`.

The three install routes exist because not every tool can be handled the same
way:

| Route | Tools | How |
| ----- | ----- | --- |
| Version manager | JDK, Maven, Rust | `mise use --global <pin>` |
| Official installer | Android CLI | Google's own install script, user-scoped, no admin rights |
| Report only | Docker | Named with a pointer to the install matrix; a system service is not something a version manager installs |

Two consequences worth knowing:

- **The set is deduplicated.** `api` and `android` both want a JDK, and only one
  gets downloaded.
- **`init` is idempotent.** It re-derives from the current `platforms.json` every
  time, so after you enable another platform by hand the fix is to run it again.
  A tool that probes `ok` is left alone.

`--docker` means "the API runs in a container", so its host JDK and Maven are
not needed. It is opt-in and never inferred: the documented default keeps MySQL
and Redis in Docker while the API itself runs on the host, so a reachable Docker
is no evidence of the arrangement. The flag is also scoped — in an `api` +
`android` project Maven is skipped but the JDK is still installed, because
Gradle runs on the host.

Anything `init` could not install prints the path to
`.agents/skills/marsquakes-setup/references/install-matrix.md`, which carries the
per-OS commands and version floors. And because a child process cannot change
its parent shell's environment, a successful install ends by telling you to open
a new shell so the tool lands on `PATH`.

## `mars clean`

```bash
mars clean     # remove build artifacts across the workspace
```

## Docker mode

`--docker` exists for CI and packaging. Day-to-day development runs your own code
on the host and keeps only MySQL and Redis in containers — see
[Start a Project](./ai-start.md).

`--docker` means two different things depending on the command, so keep them
apart:

| Command | What `--docker` does |
| ------- | -------------------- |
| `init` | Only declares that the API will run in a container, so its host JDK and Maven are skipped. Nothing is built, nothing is started. |
| `dev`, `build` | Actually builds an image for the platform and runs your code inside a container. |

The rest of this section describes the second meaning only. Adding `--docker`
to `dev` or `build` makes the CLI:

1. Verify Docker is installed.
2. Resolve the platform directory from `platforms.json` (`dir`, defaulting to
   `apps/<platform>`).
3. Pick a Dockerfile variant for the mode, falling back down the list:

   | Mode | Variant order |
   | ---- | ------------- |
   | `dev` | `Dockerfile.dev` → `Dockerfile.build` → `Dockerfile` |
   | `build` | `Dockerfile.build` → `Dockerfile` |

4. Build `marsquakes/<platform>:<mode>` with the **repository root** as the
   build context.
5. Run it as `marsquakes-<platform>-<mode>`, publishing port 3100 for
   `web`/`web-admin` and 8080 for `api`.

See [Docker](./docker.md) for the Dockerfile layout and the base-image
constraints that matter.

## Running without installing

From inside a clone of the template repository:

```bash
node packages/mars-cli/bin/mars.js create my-app --from .
```

This is the fastest way to test template changes before publishing.
