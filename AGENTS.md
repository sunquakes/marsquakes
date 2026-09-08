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
mars init                          # Install workspace deps + the toolchains platforms.json asks for
mars init --docker                 # Same, but the API runs in a container (skips the host JDK/Maven)
mars clean                         # Clean build artifacts
```

### Toolchain installation is derived, not pre-provisioned

`mars init` reads `platforms.json` and installs **only** the language toolchains
the enabled platforms actually need. A web-only project downloads no JDK, no
Maven and no Rust. This is deliberate, and the reasoning below is recorded here
because the opposite design — install everything once, up front — looks tidier
and will otherwise be reintroduced as a "simplification".

**Whoever holds the information makes the decision.** Installing every toolchain
up front is not really a choice; it is what you are forced into when the
information does not exist yet. Before `mars create` has run there is no
`platforms.json`, so nothing on the machine can know whether the user is about to
build a desktop app or a REST API — an up-front installer can only guess, and it
guesses by installing the union of everything. After `mars create`, the project
states its own platform set, so `requiredTools(platforms)` **derives** the answer
instead. That is the whole difference: derivation versus guessing.

**An up-front install is a snapshot that is only correct on the day it ran.**
Enable `desktop` three months later and the original install decision becomes
retroactively wrong, with no mechanism anywhere to notice. `mars init` is
idempotent and re-derives from the current `platforms.json`, so the fix is to run
it again. Prefer this shape for anything environment-related: describe what
should be true now, do not replay what was done once.

**The trigger point is not "as late as possible".** Installing a JDK from inside
`gradle build` would be more on-demand still, and it would be wrong: the user
believes they are compiling code, so a download stall or a network failure
surfaces as a mysterious compile error. `mars init` is the trigger because it is
the first moment where **the information suffices** (`platforms.json` exists) and
**the user still considers themselves to be preparing**. Both conditions matter;
either one alone picks the wrong moment.

Consequences that are costs, not bugs, and must not be "fixed" by moving the
install earlier:

- **Failures surface later.** A missing toolchain now fails during `mars init`
  rather than during environment setup. Keep `mars init`'s output explicit about
  what it is installing, so the delay is legible.
- **More points that need the network.** On-demand install assumes connectivity
  at project-init time. See the exceptions below for when that assumption breaks.
- **`PATH` needs a new shell.** A child process cannot mutate its parent shell's
  environment — the inherited block is a snapshot — so after `mise` installs a
  toolchain, `mars init` tells the user to open a new terminal. The `JAVA_HOME`
  caution in the docs is a downstream symptom of this, not a defect.

**Where up-front installation is the correct answer.** Three cases, unified by
the fact that the information already exists beforehand, so nothing is being
guessed:

| Case | Why up front wins |
|------|-------------------|
| CI runners and Docker base images | The platform set is fixed by the image's purpose, and baking toolchains into a layer makes the build cache work and needs zero network at run time |
| Offline / air-gapped or intranet-only machines | On-demand install assumes it can reach the network at init time; here it cannot |
| Uniform fleet or teaching machines | Per-machine variation is the thing being eliminated, not a property worth preserving |

Note that this is the same principle, not an exception to it: in all three the
decision is made where the information lives. The Dockerfiles in this repository
therefore install their toolchains in the image, and are right to.

**Ownership split.** Five categories, decided by who knows what:

| Tools | Decided by | Installed at |
|-------|-----------|--------------|
| Node.js, pnpm, git, `@marsquakes/cli`, `mise` | Bootstrap necessity — a Node program cannot install Node | Environment setup, before any project exists |
| Docker, Tauri system libraries | Nothing can automate them here — `mise` installs neither | Environment setup, manually, reported by `mars init` |
| Android CLI + SDK | Outside mise, but Google ships an installer — `mars init` drives both | `mars init`, the SDK packages derived from `compileSdk` |
| Docker **as a runtime choice** | **The user**, via `mars init --docker` | Never inferred: Docker being installed does not mean the API runs in a container |
| JDK, Maven, Rust | **`platforms.json`** | `mars init` |

The **Docker as a runtime choice** row is the one most often got wrong. Detecting
a working Docker and concluding the API is containerised breaks the documented
workflow where MySQL
and Redis run in containers while the API stays on the host. And `--docker` skips
a host toolchain only when no other enabled platform claims it: in an
`api` + `android` project Maven is skipped but the JDK is still installed,
because Gradle runs on the host.

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
3. Reads the whitelisted build-time keys from `.env` and forwards them as `--build-arg`
   (see "Build-time configuration" below) — a bare `docker build` does not read `.env` itself
4. Builds image: `docker build [--build-arg ...] -f <platform-dir>/Dockerfile[.build|.dev] -t marsquakes/<platform>:<mode> .`
5. Runs container: `docker run`

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
| `docker-compose.infra.yml` | Base services (MySQL + Redis). Additive, combined with `-f` | `docker compose -f docker-compose.infra.yml up -d` |

The **project name is pinned to `marsquakes`** via `COMPOSE_PROJECT_NAME` in `.env`
(shipped in `.env.example`, and rewritten by `mars create` to the new project's name).
It must be set through the environment, not the YAML: compose v2.0.0 rejects the top-level
`name:` key with `(root) Additional property name is not allowed`. Leaving it unset makes
compose fall back to the lower-cased directory name, so a checkout in `RubyAlbum/` silently
produces a project called `rubyalbum` — which then diverges from the containers a colleague
started from a differently named folder. Project names must be lower-case.

Renaming the project is safe for state here **only because** every volume and network sets an
explicit `name:` and every service sets `container_name`, so none of them carry the project
prefix. Drop any of those and a rename starts creating fresh, empty volumes instead of reusing
the existing ones — which looks like data loss.

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

Rules for the additive base-services file:
- It contributes **new services only** and never `extends` anything, so it composes with either
  application stack: `-f docker-compose.yml -f docker-compose.infra.yml` and
  `-f docker-compose.build.yml -f docker-compose.infra.yml` both resolve. Two files that each
  `extends` the same root file could not be stacked this way.
- It re-declares `networks.jeecg-boot` with the same key **and** the same `name: jeecg_boot`,
  which is what makes stacking resolve to one shared network instead of creating a second.
- The app services keep `${MYSQL_HOST:-host.docker.internal}` as their default, so switching
  between external and in-network databases is an `.env` change (`MYSQL_HOST=mysql`,
  `REDIS_HOST=redis`), never a compose-file edit.
- Host ports default to the standard 3306 / 6379 so existing connection strings and IDE data
  sources keep working. A host that already has MySQL or Redis bound there must override
  `MYSQL_HOST_PORT` / `REDIS_HOST_PORT` in `.env` rather than edit the compose file.
- When adding a service here, keep it **optional**: nothing in `docker-compose.yml` may declare
  `depends_on` against it, because compose rejects a dependency on a service it cannot resolve
  when that file runs alone.

**YAML gotcha:** never put a comment inside a multi-line plain scalar (e.g. a `command:` written
as several unquoted lines). The parser reads the `#` line as a new mapping key and fails with
`did not find expected key`. Use a sequence (`- --flag`) when the flags need comments.

**Interpolation gotcha:** the `${VAR:-default}` form works fine on compose v2.0.0 (the version on
this machine) and is used throughout these files — `${MYSQL_HOST:-host.docker.internal}`,
`${MYSQL_HOST_PORT:-3306}`, the `build.args` in `docker-compose.build.yml`. What v2.0.0 does
**not** support is the `${VAR:+value}` *alternate-value* form inside service definitions: it aborts
with `invalid interpolation format ... You may need to escape any $ with another $`, and older
1.x silently dropped the `$` and passed the braces through literally, which made redis die with
`wrong number of arguments` while reading its own config. When a flag must appear only if a
variable is set, pass the variable through `environment:` and defer the expansion to the
container's shell by writing `$${VAR:+...}` inside an `sh -c` command. Note that
`docker compose config` re-escapes `$$` on output, so it cannot confirm what the container
actually receives — verify with `docker compose run --rm <svc> sh -c 'echo ...'` instead, and
test both the set and the unset branch.

### Build-time configuration (package sources)

`.env` is read automatically by `docker compose` and **never** by a bare `docker build`. That
asymmetry is the whole reason this section exists.

Anything that has to influence a build — as opposed to a running container — must travel
`.env` → `build.args` → Dockerfile `ARG` → shell reference. `environment:` cannot do it: it only
exists at runtime, long after `npm config set` and the generated `settings.xml` have already run.

Two knobs use this path today, and both default to the **official** sources so that a clean
checkout behaves identically on every network:

| Variable | ARG default | Consumed by |
|----------|-------------|-------------|
| `NPM_REGISTRY` | `https://registry.npmjs.org` | `apps/web-admin/Dockerfile.build`, `Dockerfile.dev` |
| `MAVEN_MIRROR_URL` | `https://repo.maven.apache.org/maven2` | `apps/api/Dockerfile.build`, `Dockerfile.dev` |

On a mainland-China network both are slow enough that the Maven dependency download can look
like a hang, so the repository ships **two `.env` templates** instead of asking everyone to
hand-edit one. Keep the mirrors *out* of the tracked defaults in the Dockerfiles and in
`docker-compose.build.yml` — `.env` is gitignored precisely so network-local choices stay local.

| Template | `NPM_REGISTRY` / `MAVEN_MIRROR_URL` | Use when |
|----------|-------------------------------------|----------|
| `.env.example` | `registry.npmjs.org` / `repo.maven.apache.org` | default; matches the `ARG` defaults |
| `.env.example.cn` | `registry.npmmirror.com` / `maven.aliyun.com` | mainland-China network |

Rules for the two templates:
- They **must declare the same keys, in the same order, with the same values** — only the two
  package-source URLs and the surrounding explanatory comments may differ. A key added to one
  and forgotten in the other is the whole failure mode this pair invites.
- `.env.example` is the canonical file: every reference in the READMEs, the docs site and
  `docker-compose.infra.yml` points at it. Generate `.env.example.cn` *from* it rather than
  editing both by hand.
- Register every new template in `filesToReplace` in `packages/mars-cli/bin/mars.js`. `copyDir`
  excludes only `.git`, `node_modules`, `.gradle`, `build`, `dist`, `.turbo` and `.idea`, so
  dotfiles **are** copied into generated projects — an unregistered template ships with this
  repository's `COMPOSE_PROJECT_NAME=marsquakes` still baked in.
- Both files are LF-only with no BOM. A BOM would make compose read the first key name with
  three invisible bytes glued to it.
- `pnpm check:env` (`scripts/check-env-example.js`) enforces all of the above and exits non-zero
  on drift. It also verifies the two source URLs actually *differ* — if they ever converge, the
  mirror variant has no reason to exist.

Rules when adding another build-time knob:
- Declare the `ARG` with a working default, so a bare `docker build` with no flags still succeeds.
- Add it to `build.args` in `docker-compose.build.yml` as `${VAR:-<same default>}`. Repeating the
  default there is deliberate: it keeps a `.env` that lacks the key building against the same
  source as the Dockerfile.
- Add it to **both** `.env` templates, or `pnpm check:env` fails.
- Add it to `DOCKER_BUILD_ARG_KEYS` in `packages/mars-cli/bin/mars.js` if `mars build --docker`
  should forward it. That list is a **whitelist, not a passthrough** — `.env` also holds
  `MYSQL_PASSWORD` / `REDIS_PASSWORD`, and build args are visible in plain text in
  `docker history`, so forwarding `.env` wholesale would bake secrets into published layers.
- Never bake a secret into an `ARG`. Use a runtime `environment:` entry, or BuildKit secrets.

**Maven `settings.xml` quoting:** the file is generated by `printf '%s\n'` with one argument per
line, and `printf` arguments are shell-literal when single-quoted. Only the `<url>` line is
double-quoted, which is what lets `${MAVEN_MIRROR_URL}` expand; single-quoting it would write the
literal text `${MAVEN_MIRROR_URL}` into the XML and break resolution in a way the Maven error
message does not explain. The mirror entry is written unconditionally because a `mirrorOf central`
pointing at Central's own URL is a no-op — one always-exercised code path beats a conditional
whose branches are never both tested on the same host.

**pnpm inherits npm's registry** from `~/.npmrc` (verified in a `node:20-bullseye-slim`
container: `npm config set registry <mirror>` then `pnpm config get registry` returns the
mirror). So the `npm config set` that runs *before* `npm install -g pnpm` is the call that
actually matters. The following `pnpm config set` is redundant today and kept only as explicit
intent should pnpm ever stop reading npm's config.

**`NPM_REGISTRY` is overridden by pinned tarballs in the lockfile.** A lockfileVersion 9.0
`resolution:` entry may carry an explicit `tarball:` field, which is an absolute URL and wins over
any registry config. The official registry is the implicit default and therefore writes no
`tarball:` at all, so a lockfile generated behind a mirror ends up with mirror URLs baked in — and
because the Dockerfiles use `pnpm install --frozen-lockfile`, they cannot be re-resolved at build
time. `apps/web-admin/pnpm-lock.yaml` had 246 of its 1665 resolutions pinned to
`registry.npmmirror.com` this way, which silently made `NPM_REGISTRY` a no-op for those packages;
the fields were stripped so every entry now honours the configured registry.

Guard this when regenerating the file: run `pnpm install` with the official registry configured, and
check with `Select-String -Pattern 'tarball:' apps/web-admin/pnpm-lock.yaml` — the expected count is
**zero**. If a mirror is needed locally, set it in `.env` / `NPM_REGISTRY` for the *build*, not in
the committed lockfile. Note the file is pure LF with no BOM, so edit it with
`[System.IO.File]::WriteAllText` and a `UTF8Encoding($false)`; PowerShell's `Set-Content` rewrites
all 15,603 lines to CRLF and turns a 246-line diff into a whole-file rewrite.

To validate the lockfile the way the image does, add `--ignore-workspace`:
`pnpm install --frozen-lockfile --lockfile-only --ignore-workspace` inside a copy of just
`package.json` + `pnpm-lock.yaml` + `.npmrc`. Without that flag pnpm walks *up* to
`pnpm-workspace.yaml`, reports "Scope: all N workspace projects" and validates the **root**
lockfile instead — a green run that proves nothing about the file you edited.

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
`eclipse-temurin:17-jre-focal`, `node:22-bullseye-slim`, `nginx:stable`, and any `alpine` tag.
`--security-opt seccomp=unconfined` also bypasses it; upgrading Docker to 23+ removes the
constraint entirely.

**This applies to MySQL too — it is not a JVM/Node-only problem.** The `mysql` images are
Oracle Linux based, and Oracle Linux 9 ships glibc 2.34, so a floating `mysql:8.0` breaks the
moment upstream rebases. Measured here: `mysql:8.0.36` (OL 8.9, glibc 2.28) works,
`mysql:8.0.40` (OL 9.5) and `mysql:8.0` (OL 9.7, currently 8.0.46) both fail. `apps/api/db/Dockerfile`
therefore pins the **patch** version, not `8.0`. The MySQL symptom is different from the JVM
one and much more misleading: `Can't create thread to handle bootstrap (errno: 1)` then
`Data Dictionary initialization failed` during `--initialize`, i.e. **before any
`/docker-entrypoint-initdb.d` script runs**. The container then restart-loops on
`--initialize specified but the data directory has files in it`, which buries the first failure
far up the log and looks like a corrupt volume. When bumping the pin, verify the tag's glibc
first: `docker run --rm --entrypoint sh mysql:<tag> -c "ldd --version | head -1"`.

**Schema-dump note:** `apps/api/db/jeecgboot-mysql-5.7.sql` is named after the Navicat *source*
server (5.7.38), not a server requirement. It loads cleanly into 8.0 — every identifier is
backtick-quoted (so 8.0's new reserved words such as `rank` / `groups` / `over` are harmless),
and it contains no `NO_AUTO_CREATE_USER`, no `GRANT ... IDENTIFIED BY`, no zero-dates and no
MyISAM. `CHARACTER SET utf8` and `int(11)` are deprecated but accepted, and at the default
`log_error_verbosity` they do not even reach the error log. Do not "upgrade" the dump or
downgrade the server: 5.7 has been EOL since October 2023.

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
- **Platform-specific commands**: whenever an example differs per operating
  system, offer **every** supported platform side by side — never only the one
  the author happens to use. See the rules below.

### Platform-specific commands must be switchable

A code or command example whose content depends on the operating system **MUST**
present all supported platforms together. Writing only the macOS form leaves
every Windows reader guessing, and the guess usually fails silently — `mise`
without its PowerShell hook installs successfully and then puts nothing on
`PATH`.

This applies whenever any part of the example changes with the platform:

| Trigger | Example |
|---------|---------|
| Different package manager | `brew install` / `winget install` / `apt install` |
| Different wrapper or launcher | `./gradlew` / `gradlew.bat` |
| Different path separator or variable | `$HOME/.agents` / `$HOME\.agents`, `$PROFILE` |
| Different shell built-in | `chmod 600` has no PowerShell equivalent |
| Different archive or file tooling | `unzip` / `Expand-Archive` |

**In the documentation site** (`docs/content/`, `docs/i18n/**`,
`docs/src/pages/`), use a Docusaurus `<Tabs>` group so the reader switches
platform instead of scrolling past commands that do not apply to them. The
attribute vocabulary is fixed — `groupId="os"`, `value="unix"|"windows"`, labels
`macOS / Linux` and `Windows (PowerShell)` — because Docusaurus persists the
choice **by group id and value**, so a group that invents its own values
silently drops out of the sync and forces the reader to choose again.
[docs/AGENTS.md](docs/AGENTS.md) holds the full convention, including what may go
inside a tab and how the landing page differs.

**Everywhere else** — `README*.md`, every `AGENTS.md`, `.docs/`, and any comment
or help text — `<Tabs>` is unavailable, since it is a component of the docs site
rather than Markdown syntax. Use consecutive fenced blocks, each introduced by a
bold platform label and tagged with the matching language so the shell is
unambiguous:

````md
**macOS / Linux**

```bash
./gradlew assembleRelease
```

**Windows (PowerShell)**

```powershell
.\gradlew.bat assembleRelease
```
````

Rules that hold in both forms:

- **Identical commands do not get a switcher.** The five `mars` quick-start
  commands are byte-identical in bash and PowerShell, so splitting them would
  render two indistinguishable panels — a control that visibly does nothing,
  which is worse than no control. Split at the first line that actually differs
  and keep the shared tail outside the group, where two copies cannot drift.
- **Never omit a platform to keep things symmetrical.** When a step has no
  equivalent, say so in that platform's block. A silently missing platform reads
  as an unfinished page; "not needed on Windows, because …" reads as a decision.
- **Never invent a command.** Every platform-specific command must be traceable
  to [.agents/skills/marsquakes-setup/references/install-matrix.md](.agents/skills/marsquakes-setup/references/install-matrix.md),
  which is the single source of truth for per-OS install commands and version
  floors. If a command is not there and you cannot verify it, write prose.
- **Keep the lead-in platform-neutral.** The sentence above the example states
  the goal; the blocks state the platform. A lead-in that says "run this in
  bash" contradicts its own Windows block.