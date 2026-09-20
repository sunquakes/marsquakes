---
id: create-project
title: Start a Project
---

# Start a Project

Second stage: create the project, choose its platforms, then install exactly the
toolchain those platforms imply. Follow the steps in order; running and building
are [Step 3](#run-and-build-the-project), per-platform detail on the platform pages.

## Step 1 — Create the project and pick platforms {#create-the-project}

```bash
mars create my-app
```

You are asked which platforms to include. `web-admin` and `api` are pre-selected;
everything else is opt-in. A tick decides two things: which directories end up in
your project **and** which toolchain
[`mars init`](#initialize-the-project) will check and install. Each row shows
that cost before you tick it:

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

The summary line is deduplicated like the install itself — ticking both `api`
and `android` lists one JDK; rows without a `↳ toolchain:` line add nothing
beyond the Node and pnpm you already have. Navigate with `↑` `↓`, toggle with
`space`, confirm with `enter`. Without a TTY (CI, an editor shell), type numbers
to toggle, `a` for all, `n` for none, `enter` for defaults.

To take the two defaults without a prompt:

```bash
mars create my-app --non-interactive
```

This ticks `web-admin` and `api` (and therefore still opts into the `api`
toolchain); other combinations go through the prompt — `create` has no
`--platform` option; [AI Agents](./ai-agents.md) documents its input syntax.

### What you get {#what-you-get}

`mars create` copies a real, running template trimmed to your selection — not a
skeleton. Unselected platforms are never copied, and their toolchains are never
installed. See [Platforms](./platforms.md#the-platform-matrix) for contents and
the [CLI Reference](./cli.md#what-create-does) for the exact `create` steps.

## Step 2 — Initialize the project {#initialize-the-project}

When `create` finishes it prints the next commands. Enter the project and run
`mars init`:

```bash
cd my-app
mars init
```

`mars init` runs `pnpm install` itself — it **replaces** that step, so do not run
`pnpm install` separately. It then reads `platforms.json`, probes only the
toolchains the enabled platforms need, and installs missing ones with
[mise](https://mise.jdx.dev); a web-only project downloads no language toolchain.
Each download names its provenance, so an unexpected one traces to the row that
asked for it:

```
🧰 Toolchain required by this project: Docker, JDK, Maven
   (derived from: API Service)
```

If the API will only ever run in a container, skip the host JDK and Maven:

```bash
mars init --docker
```

This is opt-in rather than detected: having Docker installed does not mean the
API runs inside it — the [Docker page](./docker.md) runs MySQL and Redis in
containers while the API stays on the host, which still needs a host JDK. In an
`api` + `android` project only Maven is skipped, because Gradle runs on the host.

Three things are **reported, not installed** — no version manager manages system
services, GUI apps or C libraries: **Docker**, the **Android SDK** and the
**Tauri system prerequisites**. Install mise before `mars init`, or everything
falls back to being reported. A successful install asks you to open a new shell
so the tools land on `PATH`; see [`mars init`](./cli.md#mars-init) for the full
sequence, including the Android SDK packages derived from `compileSdk`.

### Adding a platform later {#adding-a-platform-later}

Enable it in `platforms.json` and run `mars init` again:

```bash
mars init
```

It installs only what the new platform needs and skips what is already there, so
re-running is safe and is the only step required. A platform skipped during
`create` was never copied, so enabling one also needs its `apps/<platform>`
directory — see
[Enabling a platform after creation](./platforms.md#enabling-a-platform-after-creation).
Whenever the platform set changes, run `mars init` again.

### When installing everything up front is better {#when-installing-everything-up-front-is-better}

On a personal laptop nothing has to be decided up front. Install toolchains up
front instead when the machine's purpose is already fixed:

| Situation | Why up front wins |
| --------- | ----------------- |
| CI runners and Docker images | The image's purpose fixes what it builds; toolchains baked into a layer are cached and need no network at run time — the [Docker workflow](./docker.md) does this |
| Offline or intranet-only machines | On-demand install assumes it can download at `mars init` time; install while you have connectivity |
| Uniform team or classroom machines | Identical machines are the goal, so per-machine differences are not worth preserving |

## Step 3 — Run and build the project {#run-and-build-the-project}

Workspace commands read the same `platforms.json` as `init` and act on every
enabled platform.

### Start everything at once

```bash
mars dev
```

To focus on one platform:

```bash
mars dev --platform web-admin
```

Web workspaces start through Turborepo; native platforms use their own toolchain
— only `android` has a wired script (`gradlew installDebug`) so far, and `ios`,
`windows`, `linux` and `macos` print a "pending" notice. The `api` is a Maven
module rather than a pnpm workspace member, so it has no `dev` script and is
started by hand — see the platform pages.

### Build everything at once

```bash
mars build                          # every enabled platform
mars build --platform web-admin
mars build --platform api --docker
```

`build` is implemented for `web`, `web-admin`, `desktop` and `android`; other
platforms report that building is not supported yet. `--docker` builds and runs
inside a container instead of on the host — see [Docker](./docker.md).

### Clean

```bash
mars clean
```

Removes build artifacts across the workspace.

### Per-platform guides

Every enabled application is documented as the same three stages — environment
setup, develop, deploy. "Ready" platforms build and run out of the box;
"Scaffold only" platforms reserve the structure but are placeholders — see
[Platforms](./platforms.md#the-platform-matrix).

| Application | Maturity | Start here |
| ----------- | -------- | ---------- |
| Admin System — Web Admin + API (`apps/web-admin`, `apps/api`) | Ready | [Environment setup](./guide-admin-env.md) |
| Desktop (`apps/desktop`) | Ready | [Environment setup](./guide-desktop-env.md) |
| Android (`apps/android`) | Scaffold only | [Environment setup](./guide-android-env.md) |
| Web, iOS, Windows, Linux, macOS | Scaffold only | covered by the [platform matrix](./platforms.md#the-platform-matrix) |

Each platform directory also carries an `AGENTS.md` with its build commands,
coding standards and gotchas — read it before touching that platform.

## Step 4 — Keep the wiring current

Pull later build-wiring improvements into an existing project without touching
application code:

```bash
mars update
```

This refreshes `AGENTS.md`, `turbo.json`, `pnpm-workspace.yaml`, `platforms.json`,
`package.json`, `scripts/` and `packages/`, and deliberately skips `apps/`,
`docs/`, `.docs/` and `design/`. Replaced files are backed up to
`.mars-update-backup` first. See [`mars update`](./cli.md#mars-update).
