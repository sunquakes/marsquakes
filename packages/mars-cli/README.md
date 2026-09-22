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
mars init
mars dev
```

`mars create` asks which platforms you want; `mars init` is what makes that
answer real on your machine, installing the toolchain each ticked platform
needs.

## Commands

```bash
mars create <project-name>    Create a new project from template
mars update                   Update project from template (preserves apps, docs, .docs)
mars dev                      Start development server (default: all enabled platforms)
mars build                    Build project (default: all enabled platforms)
mars init                     Install dependencies + the toolchain your enabled platforms need
mars clean                    Clean all build artifacts
```

`mars init` reads `platforms.json`, works out which toolchains the enabled
platforms need, checks each one against its minimum version and installs the
ones that are missing. Run it again after enabling a platform.

### Options

| Option                  | Applies to       | Description                                  |
| ----------------------- | ---------------- | -------------------------------------------- |
| `--template <url>`      | create           | Use a custom git repository as template      |
| `--from <path>`         | create           | Use a local directory as template            |
| `-n, --non-interactive` | create           | Skip the prompts and use default platforms   |
| `--platform <platform>` | dev, build       | Run only for a specific platform             |
| `--docker`              | init, dev, build | Use Docker for the API platform              |
| `--lang <en\|zh>`       | all              | Set the output language (default: `en`)      |
| `--help`                | all              | Show the help message                        |

On `dev`/`build`, `--docker` builds an image and runs the code inside it. On
`init` it only declares that the API will run in a container, so the host JDK
and Maven are skipped — unless another enabled platform still needs them.

### Examples

```bash
mars create my-app -n                  # non-interactive, default platforms
mars create my-app --from ./template   # scaffold from a local directory
mars init --docker                     # skip the host JDK/Maven, run the API in Docker
mars dev --platform web                # start the web client only
mars build --platform api --docker     # build the API inside Docker
```

## Platforms

| Platform  | Directory        | Tech stack               | Default | Toolchain it requires  |
| --------- | ---------------- | ------------------------ | ------- | ---------------------- |
| API       | `apps/api`       | JeecgBoot / Spring Boot  | yes     | Docker, JDK, Maven     |
| Web Admin | `apps/web-admin` | Vue 3 + Vite             | yes     | —                      |
| Desktop   | `apps/desktop`   | Tauri + React + Rust     | no      | Rust                   |
| Web       | `apps/web`       | TBD                      | no      | —                      |
| Android   | `apps/android`   | Kotlin + Jetpack Compose | no      | JDK, Android CLI + SDK |
| iOS       | `apps/ios`       | Swift + SwiftUI          | no      | —                      |
| Windows   | `apps/windows`   | TBD                      | no      | —                      |
| Linux     | `apps/linux`     | TBD                      | no      | —                      |
| macOS     | `apps/macos`     | TBD                      | no      | —                      |

Unselected platforms are never copied, so the generated repository stays small —
and their toolchains are never installed either, so the machine stays small too.
`mars init` takes the union of the toolchain column across your enabled
platforms, so `api` + `android` downloads one JDK, not two. A `—` means the
platform adds nothing beyond Node and pnpm, either because it builds with those
or because it builds with an OS toolchain no version manager can install (`ios`
needs Xcode, `windows` MSVC, `linux` gcc).

The generated project keeps a single source of truth, `platforms.json`, which
records every platform, its directory, its tech stack and whether it is
enabled. `mars dev`, `mars build` and `mars clean` all read that file instead of
hard-coding paths, and `mars init` derives the toolchain it installs from the
same file.

## Requirements

- Node.js >= 22.12.0
- pnpm >= 9 (`corepack enable pnpm`)
- git

Platform-specific toolchains (JDK, Maven, Rust, Android CLI + SDK, Xcode) are
only needed for the platforms you actually enable, and `mars init` installs them
for you — except the ones no version manager can provide, such as Xcode, which
it reports instead. The `--docker` flag compiles inside an image instead, so a
clean checkout can build without a local toolchain.

## Documentation

📖 **<https://marsquakes.cc/>**

## License

[Apache-2.0](./LICENSE)
