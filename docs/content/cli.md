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
| `init` | Install dependencies and check the environment |
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

| Platform | Category | Enabled by default |
| -------- | -------- | ------------------ |
| `web-admin` | web | yes |
| `api` | api | yes |
| `web` | web | no |
| `android` | mobile | no |
| `ios` | mobile | no |
| `desktop` | desktop | no |
| `windows` | desktop | no |
| `linux` | desktop | no |
| `macos` | desktop | no |

Unselected platforms are never copied into the new project — the directory is
skipped entirely rather than copied and deleted.

### What `create` does

1. Resolves the template and copies everything **except** `apps/`.
2. Copies only the `apps/<name>` directories you selected.
3. Rewrites `platforms.json` so `enabled` matches your selection.
4. Replaces the project name across the generated files (`package.json`,
   `AGENTS.md`, `platforms.json`, compose files and others).
5. Deletes the template's `.git`, initialises a fresh repository and creates an
   `init: create project from template` commit.

It then prints the three commands you need next:

```bash
cd my-app
pnpm install
mars dev
```

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
mars dev --platform api --docker
```

Web workspaces are started through Turborepo. Native platforms are started
through their own toolchain — currently only `android` has a wired script
(`gradlew installDebug`); `ios`, `api`, `windows`, `linux` and `macos` print a
"pending" notice when started natively, so use `--docker` for `api`.

## `mars build`

```bash
mars build
mars build --platform web-admin
mars build --platform api --docker
```

`build` is implemented for `web`, `web-admin`, `desktop` and `android`. Other
platforms report that building is not supported yet.

## `mars init` / `mars clean`

```bash
mars init      # install dependencies + check the toolchain of each enabled platform
mars clean     # remove build artifacts across the workspace
```

## Docker mode

Adding `--docker` to `dev` or `build` makes the CLI:

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
