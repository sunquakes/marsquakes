# Marsquakes - AGENTS.md

## Project Overview

- **Project Name**: Marsquakes
- **Multi-platform Project**: Android / iOS / Web / API / Windows / Linux / macOS / Desktop
- **Monorepo Tools**: pnpm workspace + Turborepo
- **Platform Configuration**: `platforms.json` (defines enabled platforms and tech stacks, AI automatically generates directories based on this)

## Directory Rules (Globally Applied)

### Work Mode
- All program design documents, tasks, and PRDs **MUST** be generated in `./.docs/` or `./.docs/task/` directories
- **API interface documents** **MUST** be generated in `./.docs/api/` directory
- Prohibit placing document files directly in the project root directory or other locations
- `./.docs/` holds **internal** engineering material only. It is deliberately dot-prefixed so it stays out of the repository front page and out of the published site

### Documentation Site Mode
- The public documentation site is the Docusaurus app in `./docs/` (see [docs/AGENTS.md](docs/AGENTS.md))
- **`docs/` is NOT a platform.** It describes the project instead of being one of its shippable targets, so it is **NOT** registered under `platforms.platforms` in `platforms.json`, is **NOT** a pnpm workspace member, and is **NOT** touched by `mars dev` / `mars build` / `turbo`
- Published pages **MUST** be placed in `./docs/content/`, and the page `id` **MUST** be registered in `./docs/sidebars.ts`
- Never place PRDs, task notes, design drafts or API interface documents in `./docs/` — those belong in `./.docs/`
- Run its scripts from the repository root with `pnpm -C docs <script>` (`-C` changes directory; `--filter docs` will not resolve). `pnpm dev:docs` is a shortcut for the dev server

### Design Mode
- All design drafts, images, pages, and cutouts **MUST** be generated in `./design/` and its subdirectories
- Prohibit placing design files directly in the project root directory or other locations

### Platform Code Directories
- **Mobile**: `./apps/android/`, `./apps/ios/`
- **Desktop**: `./apps/windows/`, `./apps/linux/`, `./apps/macos/`, `./apps/desktop/`
- **Web Client**: `./apps/web/`
- **Web Admin**: `./apps/web-admin/`
- **Backend API**: `./apps/api/`

### General Prohibitions
- **Prohibit** generating design files or document files directly in the project root directory
- Temporary files, scripts, and other intermediate products should be placed in the system temporary directory, not polluting the project directory

## Project Structure Convention

```
Marsquakes/
├── apps/                    # All platform applications
│   ├── android/             # Android (Gradle, see apps/android/AGENTS.md)
│   ├── ios/                 # iOS (Xcode, see apps/ios/AGENTS.md)
│   ├── windows/             # Windows Desktop (see apps/windows/AGENTS.md)
│   ├── linux/               # Linux Desktop (see apps/linux/AGENTS.md)
│   ├── macos/               # macOS Desktop (see apps/macos/AGENTS.md)
│   ├── desktop/             # Desktop (Tauri, see apps/desktop/AGENTS.md)
│   ├── web/                 # Web Client (pnpm workspace member, see apps/web/AGENTS.md)
│   ├── web-admin/           # Web Admin (pnpm workspace member, see apps/web-admin/AGENTS.md)
│   └── api/                 # Backend API (see apps/api/AGENTS.md)
├── packages/                # Shared packages (pnpm workspace members)
│   ├── tsconfig/            # Shared tsconfig
│   ├── eslint-config/       # Shared ESLint configuration
│   └── mars-cli/            # CLI scaffolding tool (command: mars)
├── docs/                    # Public documentation site (Docusaurus, see docs/AGENTS.md)
│   └── content/             # Published Markdown pages
├── .docs/                   # Internal program design documents (not published)
│   ├── task/                # Task documents, PRDs
│   └── api/                 # API interface documents
├── design/                  # Design drafts, images, cutouts
├── scripts/                 # Initialization and tool scripts
│   └── init.js              # One-click initialization script
├── package.json             # Top-level command entry
├── pnpm-workspace.yaml      # pnpm workspace configuration
├── turbo.json               # Turborepo pipeline configuration
├── platforms.json           # Platform configuration (enabled/disabled platforms and tech stacks)
├── AGENTS.md                # This file (global rules)
└── .gitignore
```

## CLI Scaffolding

This project provides the `mars` CLI tool, which can be installed globally to quickly create new projects.

### Installation

```bash
pnpm add -g @marsquakes/cli
```

### Create Project

```bash
mars create my-project
mars create my-project --template <git-url>
mars create my-project --from <local-path>
```

### Development & Build

Run in the project directory (automatically reads `platforms.json` to determine enabled platforms):

```bash
mars dev                           # Start all enabled platforms
mars dev --platform web            # Start Web only
mars dev --platform android        # Start Android only
mars dev --platform api --docker   # Start API in Docker (automatically builds image first)
mars build --platform web          # Build Web only
mars build --platform android      # Build Android only
mars build --platform api --docker # Build API in Docker
mars init                          # Initialize dependencies + check environment
mars clean                         # Clean build artifacts
```

### Docker Support

Dockerfiles live **inside each platform directory**, next to the code they build.
There is no top-level `docker/` directory.

Variants are named after **whether the image compiles the source itself**, not after a CLI verb.
The bare `Dockerfile` never contains a compile stage — it only packages an existing artifact.

| File | Purpose | Used by |
|------|---------|---------|
| `<platform-dir>/Dockerfile` | **Default.** No compile stage — packages an **already-compiled** artifact (jar / dist). Builds in seconds. Fails if the artifact is absent | CI pipelines, `docker-compose.yml` |
| `<platform-dir>/Dockerfile.build` | Self-contained multi-stage build — compiles from source inside the image, so the host needs no JDK/Node toolchain. Works on a clean checkout | `mars build --platform <p> --docker`, `docker-compose.build.yml` |
| `<platform-dir>/Dockerfile.dev` | Development image (source mounted as volume, hot reload) | `mars dev --platform <p> --docker` |
| `<platform-dir>/nginx.conf` | Static hosting / reverse proxy config for web platforms (optional) | referenced by `Dockerfile` and `Dockerfile.build` |

The `--docker` flag automatically:
1. Checks if Docker is installed
2. Resolves the platform directory from `platforms.json` (`dir` field, defaults to `apps/<platform>`),
   then picks the variant for the mode: `dev` → `Dockerfile.dev`, `build` → `Dockerfile.build`,
   each falling back to the bare `Dockerfile` when the dedicated variant is absent
3. Builds image: `docker build -f <platform-dir>/Dockerfile[.build|.dev] -t marsquakes/<platform>:<mode> .`
4. Runs container: `docker run`

**Build context is always the repository root.** All `COPY` instructions must therefore use
repo-root-relative paths (e.g. `COPY apps/api/pom.xml ./`), which allows a Dockerfile to reach
workspace-level files such as `pnpm-workspace.yaml`, `turbo.json` and `packages/*`.
`.dockerignore` at the repo root controls what is sent to the daemon — note that it excludes
`**/target` and `**/dist`, so every artifact path consumed by the bare `Dockerfile` must be
explicitly re-included with a `!` rule placed **after** those exclusions.

Currently supported platforms:
| Platform | default (no compile) | with compile | dev |
|----------|----------------------|--------------|-----|
| api | `apps/api/Dockerfile` | `apps/api/Dockerfile.build` | `apps/api/Dockerfile.dev` |
| web-admin | `apps/web-admin/Dockerfile` | `apps/web-admin/Dockerfile.build` | `apps/web-admin/Dockerfile.dev` |

When adding Docker support for a new platform: create at least `Dockerfile` in that platform's
directory using repo-root-relative `COPY` paths, then add a row to the table above.
`Dockerfile.build` and `Dockerfile.dev` are optional.

### Docker Compose

Compose files live at the repo root and follow the same convention (`context: .`).
`docker-compose.build.yml` inherits from `docker-compose.yml` through the service-level
`extends` keyword, so it stays free of duplicated env vars **and** remains fully runnable
from a single `-f` — which is what GUI tools such as the VSCode Docker extension issue when
you right-click a compose file and run it.

| File | Purpose | Usage |
|------|---------|-------|
| `docker-compose.yml` | Default. Packages artifacts that were already compiled (pipeline scenario) | `docker compose up -d` |
| `docker-compose.build.yml` | Compiles inside the image — use on a clean checkout or when debugging locally | `docker compose -f docker-compose.build.yml up -d` |

Rules for the `extends`-based override file:
- Override only the keys that genuinely differ (in practice just `build.dockerfile`).
  Never re-declare env vars, ports or `extra_hosts` — `extends` already carries them over,
  and duplicating them lets the two files drift apart.
- **Top-level `networks:` is NOT inherited.** `extends` extends a *service*, not the project,
  so every network referenced by an extended service must be re-declared in the override file
  with the same key and `name:`. Omitting it fails hard with
  `service "api" refers to undefined network <net>`, which is the desired loud failure.
- `depends_on` and `container_name` *are* inherited, so the override file must not repeat them.
- Stacking both files (`-f docker-compose.yml -f docker-compose.build.yml`) still resolves
  correctly, so existing pipeline invocations keep working.

### Base Image Constraints (verified on this machine)

All Dockerfiles use **official Docker Hub images**. `docker.io` is DNS-poisoned on a direct
connection, so the Docker daemon needs an HTTP/HTTPS proxy (Docker Desktop -> Settings ->
Resources -> Proxies). With the proxy configured, every official image pulls fine — do not
substitute third-party mirrors.

Two constraints are load-bearing. Both were reproduced and fixed; do not "clean them up".

**1. Pin tags to glibc 2.31 (`-focal` / `-bullseye`).**
Docker 20.10.8's default seccomp profile does not whitelist the `clone3` syscall. Images built
on glibc >= 2.34 (`jammy`, `trixie` — which is node's *default* tag — and `amazoncorretto`) fail
to create threads with `EPERM`. The JVM misreports this as
`insufficient memory ... Cannot create worker GC thread`, which sends you hunting a
non-existent memory problem. Verified working: `maven:3.9-eclipse-temurin-17-focal`,
`eclipse-temurin:17-jre-focal`, `node:20-bullseye-slim`, `nginx:stable`, and any `alpine` tag.
`--security-opt seccomp=unconfined` also bypasses it; upgrading Docker to 23+ removes the
constraint entirely.

**2. `apps/web-admin` must keep `css.preprocessorMaxWorkers: 0` in `vite.config.ts`.**
Vite 7 defaults to `preprocessorMaxWorkers: true`, which spawns `availableParallelism() - 1`
less worker threads. Each worker's `waitUnlock()` uses `Atomics.wait(..., 5000)` with a
**hard-coded 5s timeout** and throws `Error("timed-out")` once it elapses. Inside a container
the main thread stalls long enough to trip this, so `vite build` fails on a **different `.less`
file every run** — which makes it look like a source bug rather than a timeout. Setting `0`
runs less in-process: slower, but deterministic.

Debugging tip: `vite-plugin-pwa`'s `buildEnd` hook **swallows the real error message**, leaving
an empty error in the build log. To see the actual cause, build an image that stops before the
build step and run `pnpm exec vite build --mode docker` manually inside it.


CLI automatically:
1. Copies/clones template to target directory
2. Replaces project name (`package.json`, `AGENTS.md`, `platforms.json`, etc.)
3. Initializes Git repository and commits

### Local Development Testing

Run directly within the monorepo:

```bash
node packages/mars-cli/bin/mars.js create my-project --from .
```

## Monorepo Description

This project uses **pnpm workspace + Turborepo** to manage dependencies and builds within the npm ecosystem.

### pnpm workspace

- **pnpm is the only supported package manager.** Never use `npm`, `npx` or
  `yarn` in scripts, documentation or CI. The equivalents are `pnpm add`,
  `pnpm dlx` and `pnpm run`. The version is pinned by `packageManager` in the
  root `package.json` and enforced by `engines.pnpm`
- All npm packages are managed uniformly by pnpm, root directory `pnpm install` installs all dependencies at once
- `pnpm-workspace.yaml` defines workspace members: `apps/web`, `packages/*`
- When adding new npm sub-projects, place them in `packages/` directory or declare in `pnpm-workspace.yaml`

### Turborepo

- Defines build pipelines (build / dev / lint / clean) through `turbo.json`
- Supports task caching and parallel execution to improve build efficiency
- Only applies to packages within the npm workspace, native platforms like Android/iOS still use their respective toolchains

### Common Commands

```bash
# Initialize (install all dependencies + check environment)
pnpm install
pnpm run init

# Development (Turborepo parallel start)
pnpm dev              # Start all dev tasks
pnpm dev --filter=web # Start Web only

# Build (Turborepo with caching)
pnpm build              # Build all
pnpm build --filter=web # Build Web only

# Clean
pnpm clean            # Clean all workspace build artifacts

# Android/iOS native commands (not managed by Turborepo)
pnpm dev:android      # cd apps/android && gradlew installDebug
pnpm build:android    # cd apps/android && gradlew assembleRelease
```

## Platform Configuration Description

The project defines enabled platforms through `platforms.json`. When AI initializes or adds platforms, it should read this configuration and automatically generate corresponding directories and AGENTS.md.

```jsonc
// platforms.json structure example
{
  "platforms": {
    "mobile": { "android": { "enabled": true, "dir": "apps/android" }, ... },
    "desktop": { "windows": { "enabled": true, "dir": "apps/windows" }, ... },
    "web": { "web": { "enabled": true, "dir": "apps/web" } },
    "api": { "api": { "enabled": true, "dir": "apps/api" } }
  },
  // Documentation is not a platform, so it sits outside "platforms"
  "docs": {
    "site_dir": "docs",
    "site_content_dir": "docs/content",
    "internal_dir": ".docs"
  }
}
```

When adding a new platform: Update `platforms.json` → Create corresponding directory under `apps/` → Create AGENTS.md → Update the platform table in this file.

## Platform-specific AGENTS.md

Each platform directory has its own `AGENTS.md`, containing coding standards, build commands, notes, etc. When AI processes specific platform code, it should refer to the AGENTS.md in the corresponding directory:

| Platform | AGENTS.md Path |
|----------|----------------|
| Android | [apps/android/AGENTS.md](apps/android/AGENTS.md) |
| iOS | [apps/ios/AGENTS.md](apps/ios/AGENTS.md) |
| Windows | [apps/windows/AGENTS.md](apps/windows/AGENTS.md) |
| Linux | [apps/linux/AGENTS.md](apps/linux/AGENTS.md) |
| macOS | [apps/macos/AGENTS.md](apps/macos/AGENTS.md) |
| Desktop | [apps/desktop/AGENTS.md](apps/desktop/AGENTS.md) |
| Web | [apps/web/AGENTS.md](apps/web/AGENTS.md) |
| Web Admin | [apps/web-admin/AGENTS.md](apps/web-admin/AGENTS.md) |
| API | [apps/api/AGENTS.md](apps/api/AGENTS.md) |

The documentation site is not a platform, but it follows the same convention:
see [docs/AGENTS.md](docs/AGENTS.md).

## Global Coding Standards

- **Commit Messages**: **MUST** be in English. Use concise descriptions following conventional commits format:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation
  - `style:` for code style changes
  - `refactor:` for code refactoring
  - `test:` for tests
  - `chore:` for build/tooling changes
- **Git Branches**: Main branch is `main`, feature branches named `feature/xxx`, fix branches `fix/xxx`
- **Ignored Files**: `.idea/`, `.gradle/`, `local.properties`, build artifacts, `node_modules`, `.turbo/`, etc. are already added to `.gitignore`