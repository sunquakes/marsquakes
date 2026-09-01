# Marsquakes

**English** | [简体中文](./README.zh-CN.md)

> An npm package that scaffolds multi-platform monorepos. Install it once, run `mars create`, pick the platforms you need, and you get a working repository with a backend API, an admin frontend, desktop and mobile clients already wired together by pnpm workspace + Turborepo.

[![npm](https://img.shields.io/npm/v/@marsquakes/cli.svg)](https://www.npmjs.com/package/@marsquakes/cli)
[![license](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)

## Quick start

```bash
pnpm add -g @marsquakes/cli
mars create my-app
cd my-app
pnpm install
mars dev
```

The package is named `@marsquakes/cli`, but the command it installs is `mars`.
Prefer not to install globally? `pnpm dlx @marsquakes/cli create my-app` works
too.

📖 **[Full documentation](https://sunquakes.github.io/marsquakes/)**

## What you get

`mars create` does not generate a skeleton you still have to fill in. It copies
a real, running template and trims it down to the platforms you selected:

- **A working backend** — `apps/api`, Spring Boot on JDK 17, buildable with
  Maven or entirely inside Docker.
- **A working admin frontend** — `apps/web-admin`, Vue 3 + Vite, with the
  Docker and nginx configuration already written.
- **Optional extra targets** — web client, Tauri desktop app, Android, iOS,
  Windows, Linux, macOS. Unselected platforms are never copied, so the
  generated repository stays small.
- **Working orchestration** — `pnpm install` then `mars dev` starts every
  enabled platform in parallel. No wiring step in between.
- **Docker without a local toolchain** — the `.build` image variants compile
  from source inside the image, so a clean checkout needs neither JDK, Maven
  nor Node on the host.

## Platforms

| Platform  | Directory        | Tech stack               | Default | Maturity      |
| --------- | ---------------- | ------------------------ | ------- | ------------- |
| API       | `apps/api`       | JeecgBoot / Spring Boot  | yes     | Ready         |
| Web Admin | `apps/web-admin` | Vue 3 + Vite             | yes     | Ready         |
| Desktop   | `apps/desktop`   | Tauri + React + Rust     | no      | Ready         |
| Web       | `apps/web`       | TBD                      | no      | Scaffold only |
| Android   | `apps/android`   | Kotlin + Jetpack Compose | no      | Scaffold only |
| iOS       | `apps/ios`       | Swift + SwiftUI          | no      | Scaffold only |
| Windows   | `apps/windows`   | TBD                      | no      | Scaffold only |
| Linux     | `apps/linux`     | TBD                      | no      | Scaffold only |
| macOS     | `apps/macos`     | TBD                      | no      | Scaffold only |

"Ready" means the platform builds and runs out of the box. "Scaffold only"
means the directory and conventions exist but the application code is still a
placeholder.

The generated project keeps a single source of truth, `platforms.json`, which
records every platform, its directory, its tech stack and whether it is
enabled. `mars dev`, `mars build` and `mars clean` all read that file instead of
hard-coding paths.

## CLI reference

```bash
mars <command> [options]
```

| Command                 | Description                                                        |
| ----------------------- | ------------------------------------------------------------------ |
| `create <project-name>` | Create a new project from a template                               |
| `update`                | Update the project from the template (keeps `apps`/`docs`/`.docs`) |
| `dev`                   | Start development (default: all enabled platforms)                 |
| `build`                 | Build (default: all enabled platforms)                             |
| `init`                  | Install dependencies and check the environment                     |
| `clean`                 | Remove all build artifacts                                         |

| Option                  | Applies to    | Description                           |
| ----------------------- | ------------- | ------------------------------------- |
| `--template <url>`      | `create`      | use a git repository as the template  |
| `--from <path>`         | `create`      | use a local directory as the template |
| `-n, --non-interactive` | `create`      | accept the default platform selection |
| `--platform <platform>` | `dev`/`build` | limit to one platform                 |
| `--docker`              | `dev`/`build` | run inside a Docker container         |
| `--lang <en\|zh>`       | all           | output language (default `en`)        |
| `--help`                | all           | show help                             |

Platform values: `web`, `web-admin`, `android`, `ios`, `api`, `windows`,
`linux`, `macos`, `all`.

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

## Requirements

| Tool | Version | Needed for                                      |
| ---- | ------- | ----------------------------------------------- |
| Node | >= 18   | running the `mars` CLI itself                   |
| pnpm | >= 9    | installing and running the generated project    |

pnpm is the only supported package manager. Node ships Corepack, so
`corepack enable pnpm` is enough to get the pinned version.

Everything else — JDK 17, Maven 3.9+, Rust, Android SDK, Docker 20.10+ — is
only needed for the specific platforms you enable, and the Docker workflow can
replace most of it.

---

## Working on this repository

Everything above describes the *generated* project. The rest of this section is
for people hacking on the template and the CLI itself.

### Clone

`apps/desktop` is a git submodule, so clone recursively:

```bash
git clone --recursive https://github.com/sunquakes/marsquakes.git
cd marsquakes
```

Already cloned without `--recursive`? `git submodule update --init --recursive`.

### Install and run

```bash
pnpm install
pnpm run init                # install dependencies + check every enabled toolchain

pnpm dev                     # start every enabled platform in parallel
pnpm dev:web-admin           # admin frontend only
pnpm dev:desktop             # Tauri app
pnpm dev:android             # gradlew installDebug
pnpm dev:docs                # documentation site (not a platform, runs via pnpm -C docs)

pnpm build                   # build every workspace package (Turborepo cached)
pnpm lint
pnpm type-check
pnpm clean
```

### Test the CLI without publishing

```bash
node packages/mars-cli/bin/mars.js create my-project --from .
```

### Docker

Copy the environment template first — MySQL and Redis are **external** to the
stack:

```bash
cp .env.example .env         # then edit MYSQL_* / REDIS_* / WEB_ADMIN_PORT
```

Two compose files, picked by whether the image compiles the source itself:

```bash
# Clean checkout / no local toolchain: compiles inside the image
docker compose -f docker-compose.build.yml up -d

# Artifacts already compiled (jar + dist present): packages them, builds in seconds
docker compose up -d
```

Both files are complete and standalone-runnable with a single `-f`, so the
VS Code Docker extension can run either directly.

| Service     | Image                        | Port                         |
| ----------- | ---------------------------- | ---------------------------- |
| `api`       | `marsquakes/api:3.9.3`       | `8080:8080`                  |
| `web-admin` | `marsquakes/web-admin:3.9.3` | `${WEB_ADMIN_PORT:-8807}:80` |

Dockerfiles live next to the code they build, inside each platform directory:

| File                          | Compiles source? | Purpose                                             |
| ----------------------------- | ---------------- | --------------------------------------------------- |
| `<platform>/Dockerfile`       | No               | packages an already-built artifact; fails if absent |
| `<platform>/Dockerfile.build` | Yes              | self-contained multi-stage build                    |
| `<platform>/Dockerfile.dev`   | No               | dev image, source mounted, hot reload               |

> The build context is always the repository root, so every `COPY` uses
> repo-root-relative paths. Base image tags are pinned to glibc 2.31
> (`-focal` / `-bullseye`) on purpose — see the "Base Image Constraints"
> section of [AGENTS.md](./AGENTS.md) before changing them.

### Repository layout

```
marsquakes/
├── apps/                       # Platform applications (the template payload)
│   ├── api/                    # Backend API (JeecgBoot / Spring Boot)
│   ├── web-admin/              # Admin frontend (Vue 3 + Vite)
│   ├── desktop/                # Desktop app (Tauri, git submodule)
│   ├── android/  ios/          # Mobile clients
│   └── windows/ linux/ macos/  # Native desktop targets
├── packages/                   # Shared workspace packages
│   ├── mars-cli/               # The published npm package (@marsquakes/cli)
│   ├── eslint-config/          # Shared ESLint config
│   └── tsconfig/               # Shared tsconfig
├── docs/                       # Documentation site (Docusaurus)
│   └── content/                # Published Markdown pages
├── .docs/                      # Internal design documents (not published)
│   ├── api/                    # API interface documents
│   └── task/                   # Task documents and PRDs
├── design/                     # Design drafts, images, cutouts
├── scripts/init.js             # Initialisation script
├── platforms.json              # Platform registry (enabled / tech stack / dir)
├── pnpm-workspace.yaml         # Workspace members
├── turbo.json                  # Turborepo pipeline
├── docker-compose.yml          # Default stack (no compile stage)
├── docker-compose.build.yml    # Stack that compiles inside the images
├── .env.example                # Environment variable template
└── AGENTS.md                   # Global conventions
```

### Conventions

- **Documents**: published pages go in `docs/content/`, internal design
  documents go in `.docs/` (API docs in `.docs/api/`, tasks in `.docs/task/`);
  **design assets** go in `design/`. Never drop any of them in the repository
  root.
- **Commit messages must be English**, following conventional commits (`feat:`,
  `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`, `perf:`, `ci:`,
  `revert:`). See [.trae/rules/git-commit-message.md](./.trae/rules/git-commit-message.md).
- **Branches**: `main` is the trunk, features on `feature/xxx`, fixes on
  `fix/xxx`.
- **Code comments are written in English**, including Dockerfiles and compose
  files.
- Each platform directory carries its own `AGENTS.md` with platform-specific
  rules — read it before touching that platform.

## License

[Apache-2.0](./LICENSE)

The CLI and the template wiring are released under the Apache License 2.0.
Third-party code vendored under `apps/` keeps its own upstream license —
`apps/api` and `apps/web-admin` are derived from JeecgBoot, and `apps/desktop`
is a git submodule with its own `LICENSE`. Check the license file inside a
platform directory before redistributing it.

## Author

**Shing Rui** — <sunquakes@outlook.com>
