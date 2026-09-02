# @marsquakes/cli

> Scaffold multi-platform monorepos. Install it once, run `mars create`, pick
> the platforms you need, and you get a working repository with a backend API,
> an admin frontend, desktop and mobile clients already wired together by pnpm
> workspace + Turborepo.

[![npm](https://img.shields.io/npm/v/@marsquakes/cli.svg)](https://www.npmjs.com/package/@marsquakes/cli)
[![license](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)

## Install

```bash
pnpm add -g @marsquakes/cli
```

The package is named `@marsquakes/cli`, but the command it installs is `mars`.
Prefer not to install globally? `pnpm dlx @marsquakes/cli create my-app` works
too.

## Quick start

```bash
mars create my-app
cd my-app
pnpm install
mars dev
```

## Commands

```bash
mars create <project-name>    Create a new project from template
mars update                   Update project from template (preserves apps, docs, .docs)
mars dev                      Start development server (default: all enabled platforms)
mars build                    Build project (default: all enabled platforms)
mars init                     Initialize project dependencies and check environment
mars clean                    Clean all build artifacts
```

### Options

| Option                  | Applies to | Description                                  |
| ----------------------- | ---------- | -------------------------------------------- |
| `--template <url>`      | create     | Use a custom git repository as template      |
| `--from <path>`         | create     | Use a local directory as template            |
| `-n, --non-interactive` | create     | Skip the prompts and use default platforms   |
| `--platform <platform>` | dev, build | Run only for a specific platform             |
| `--docker`              | dev, build | Run inside a Docker container                |
| `--lang <en\|zh>`       | all        | Set the output language (default: `en`)      |
| `--help`                | all        | Show the help message                        |

### Examples

```bash
mars create my-app -n                  # non-interactive, default platforms
mars create my-app --from ./template   # scaffold from a local directory
mars dev --platform web                # start the web client only
mars build --platform api --docker     # build the API inside Docker
```

## Platforms

| Platform  | Directory        | Tech stack               | Default |
| --------- | ---------------- | ------------------------ | ------- |
| API       | `apps/api`       | JeecgBoot / Spring Boot  | yes     |
| Web Admin | `apps/web-admin` | Vue 3 + Vite             | yes     |
| Desktop   | `apps/desktop`   | Tauri + React + Rust     | no      |
| Web       | `apps/web`       | TBD                      | no      |
| Android   | `apps/android`   | Kotlin + Jetpack Compose | no      |
| iOS       | `apps/ios`       | Swift + SwiftUI          | no      |
| Windows   | `apps/windows`   | TBD                      | no      |
| Linux     | `apps/linux`     | TBD                      | no      |
| macOS     | `apps/macos`     | TBD                      | no      |

Unselected platforms are never copied, so the generated repository stays small.

The generated project keeps a single source of truth, `platforms.json`, which
records every platform, its directory, its tech stack and whether it is
enabled. `mars dev`, `mars build` and `mars clean` all read that file instead of
hard-coding paths.

## Requirements

- Node.js >= 18
- pnpm >= 9 (`corepack enable pnpm`)
- git

Platform-specific toolchains (JDK, Android SDK, Xcode, Rust) are only needed for
the platforms you actually enable. The `--docker` flag compiles inside an image
instead, so a clean checkout can build without a local toolchain.

## Documentation

📖 **<https://sunquakes.github.io/marsquakes/>**

## License

[Apache-2.0](./LICENSE)
