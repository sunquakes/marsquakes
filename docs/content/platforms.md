---
id: platforms
title: Platforms
sidebar_position: 4
---

# Platforms

A platform is one selectable target in `mars create`. This page describes what
each one contains and how the generated project keeps track of them.

## The platform matrix

| Platform | Directory | Tech stack | Selected by default | Maturity |
| -------- | --------- | ---------- | ------------------- | -------- |
| API | `apps/api` | JeecgBoot / Spring Boot | yes | Ready |
| Web Admin | `apps/web-admin` | Vue 3 + Vite | yes | Ready |
| Desktop | `apps/desktop` | Tauri + React + Rust | no | Ready |
| Web | `apps/web` | TBD | no | Scaffold only |
| Android | `apps/android` | Kotlin + Jetpack Compose | no | Scaffold only |
| iOS | `apps/ios` | Swift + SwiftUI | no | Scaffold only |
| Windows | `apps/windows` | TBD | no | Scaffold only |
| Linux | `apps/linux` | TBD | no | Scaffold only |
| macOS | `apps/macos` | TBD | no | Scaffold only |

"Ready" means the platform builds and runs out of the box. "Scaffold only"
means the directory and conventions exist but the application code is still a
placeholder — useful if you want the structure reserved, not much use yet if
you want something running today.

This documentation site is deliberately absent from the table. It lives in
`docs/`, describes the project rather than being one of its shippable targets,
and is therefore not a platform — see [Conventions](./conventions.md).

## `platforms.json`

`platforms.json` at the project root is the registry every tool reads.
`mars dev`, `mars build`, `mars clean` and `scripts/init.js` all derive their
platform list from it, so no path is hard-coded anywhere.

```jsonc
{
  "platforms": {
    "mobile":  { "android": { "enabled": false, "dir": "apps/android", ... } },
    "desktop": { "desktop": { "enabled": true,  "dir": "apps/desktop", ... } },
    "web":     { "web-admin": { "enabled": true, "dir": "apps/web-admin", ... } },
    "api":     { "api": { "enabled": true, "dir": "apps/api", ... } }
  },
  // Documentation is not a platform, so it sits outside "platforms"
  "docs": {
    "site_dir": "docs",
    "site_content_dir": "docs/content",
    "internal_dir": ".docs"
  }
}
```

`mars create` writes this file for you — the platforms you ticked get
`"enabled": true`, the rest `false`.

Only entries inside `platforms` are platforms. Everything the tooling iterates
over reads that object and nothing else, which is why the documentation site is
never started, built or scaffolded by those commands.

Each platform entry carries:

| Field | Meaning |
| ----- | ------- |
| `enabled` | whether `mars dev` / `mars build` touch the platform |
| `dir` | platform directory, relative to the project root |
| `tech_stack` | human-readable stack description |
| `description` | short summary shown by the tooling |
| `status` | optional; `developing` marks a placeholder platform |

## Enabling a platform after creation

If you skipped a platform during `mars create` and want it later, the directory
was never copied — so flipping `enabled` alone is not enough. Two options:

1. **Generate a throwaway project** that includes the platform and copy the
   `apps/<platform>` directory across, then set `enabled` to `true`.
2. **Create the platform yourself** following the steps below.

## Adding a new platform

1. Add the entry to `platforms.json` under the right category.
2. Create the directory under `apps/`.
3. Add an `AGENTS.md` inside it with the platform-specific rules.
4. Update the platform table in the root `AGENTS.md`.

## Per-platform rules

Every platform directory carries its own `AGENTS.md` describing its build
commands, coding standards and gotchas. Read it before touching that platform —
these files are also what AI coding agents load as context.
