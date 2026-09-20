---
id: install
title: Environment Setup
---

# Environment Setup

This is the first stage. There is no project on your machine yet, so the only
thing to install is the tool that creates one. The language runtimes a project
needs — a JDK, Maven, Rust, the Android SDK — are installed later by
[`mars init`](./create-project#initialize-the-project), once the platforms that
need them exist.

## Requirements

| Tool | Version | Needed for |
| ---- | ------- | ---------- |
| Node | >= 22.12.0 | running the `mars` CLI itself |
| pnpm | >= 9.0.0 | installing dependencies in the generated project |

These two are the only up-front requirements.

## Step 1 — Enable pnpm

If pnpm is missing, enable it through the Corepack shim that ships with Node:

```bash
corepack enable pnpm
```

Everything else — JDK, Maven, Rust, Android SDK — is derived from the platforms
you select in the [Start a Project](./create-project.md) stage.

## Step 2 — Install the CLI

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

## Step 3 — Verify

Both commands should report a version number that meets the table above:

```bash
node --version
pnpm --version
```

If `mars` is not found after a global install, open a new terminal — a freshly
installed global bin directory is not on the `PATH` of a shell that was already
open.

## Next

With the CLI in place you are ready to
[start a project](./create-project.md).
