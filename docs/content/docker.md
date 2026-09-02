---
id: docker
title: Docker
sidebar_position: 5
---

# Docker

Every file described on this page is generated into your project by
`mars create` — the compose files at the project root, the Dockerfiles inside
each `apps/<platform>/`. You can drive them with `mars dev --docker` /
`mars build --docker`, or with `docker compose` directly.

Copy the environment template first. There are two, differing only in where the
image builds download npm packages and Maven dependencies from:

```bash
cp .env.example .env         # official registries (default)
cp .env.example.cn .env      # mainland-China mirrors
```

Then edit `MYSQL_*` / `REDIS_*` / `WEB_ADMIN_PORT`. Both templates declare the
same keys with the same values — only `NPM_REGISTRY` and `MAVEN_MIRROR_URL`
differ — so switching sources later is a two-line edit rather than a re-copy.
Run `pnpm check:env` after editing either one; it exits non-zero if the two ever
drift apart.

`.env` also carries `COMPOSE_PROJECT_NAME`, which `mars create` rewrites to your
project's name. It pins the compose project name instead of letting it default
to the lower-cased directory name, so a checkout in a differently named folder
does not silently become a different project. It has to live in the environment
rather than the YAML: compose v2.0.0 rejects the top-level `name:` key with
`(root) Additional property name is not allowed`. Project names must be
lower-case.

## Two compose files

They differ only in whether the image compiles the source itself:

```bash
# Clean checkout / no local toolchain: compiles inside the image
docker compose -f docker-compose.build.yml up -d

# Artifacts already compiled (jar + dist present): packages them, builds in seconds
docker compose up -d
```

Both files are complete and standalone-runnable with a single `-f`, so the
VS Code Docker extension can run either directly. Both treat MySQL and Redis as
**external** dependencies, reached through `host.docker.internal`.

| Service     | Image                        | Port                         |
| ----------- | ---------------------------- | ---------------------------- |
| `api`       | `marsquakes/api:3.9.3`       | `8080:8080`                  |
| `web-admin` | `marsquakes/web-admin:3.9.3` | `${WEB_ADMIN_PORT:-8807}:80` |

`docker-compose.build.yml` inherits from `docker-compose.yml` through the
service-level `extends` keyword, so it overrides only `build.dockerfile`.

:::warning
`extends` extends a *service*, not the project — top-level `networks:` is **not**
inherited. Every network referenced by an extended service must be re-declared
in the override file, otherwise compose fails with
`service "api" refers to undefined network <net>`. `depends_on` and
`container_name` *are* inherited and must not be repeated.
:::

## Base services

`docker-compose.infra.yml` supplies MySQL and Redis locally, so a clean checkout
runs end to end without a database installed on the host. It is a **separate
file combined with `-f`**, not an `extends` override: stacking merges at the
project level, which lets the same file compose with either application stack.

```bash
# Base services only — develop from the IDE against them
docker compose -f docker-compose.infra.yml up -d

# Together with the application stack
docker compose -f docker-compose.yml -f docker-compose.infra.yml up -d
docker compose -f docker-compose.build.yml -f docker-compose.infra.yml up -d
```

| Service | Image                     | Port                            |
| ------- | ------------------------- | ------------------------------- |
| `mysql` | `marsquakes/mysql:8.0.36` | `${MYSQL_HOST_PORT:-3306}:3306` |
| `redis` | `redis:7-alpine`          | `${REDIS_HOST_PORT:-6379}:6379` |

The host ports are the standard 3306 and 6379, so existing connection strings
and IDE data sources keep working. If the host already runs a MySQL or Redis of
its own, override `MYSQL_HOST_PORT` / `REDIS_HOST_PORT` in `.env` rather than
editing the compose file. Do not rely on a port clash being reported: on Linux
the bind fails loudly, but Docker Desktop on Windows may accept it anyway, in
which case clients silently keep talking to the host instance instead of the
container. Inside the network the ports are always 3306 and 6379.

:::warning
Set `MYSQL_HOST=mysql` and `REDIS_HOST=redis` in `.env` when stacking. The
defaults point at `host.docker.internal`, so leaving them alone makes `api`
quietly ignore the containers you just started — a failure that looks like a
connection problem rather than a configuration one. `.env.example` ships the
replacement block ready to uncomment.
:::

The MySQL image is built from `apps/api/db/Dockerfile`, which bakes the
JeecgBoot schema into `/docker-entrypoint-initdb.d`. Those scripts run once, in
filename order, and only while the data directory is empty — re-importing means
dropping the volume with `docker compose down -v`. Three server flags are load
bearing: `--lower_case_table_names=1` (Linux is case sensitive, the mappers are
not), `--max_allowed_packet=128M` (the 4M default aborts the ~10k-line dump
midway) and `--character-set-server=utf8mb4`.

:::caution
The base image pins a **patch** version, `mysql:8.0.36`, not the floating
`mysql:8.0` — do not tidy that back. The official `mysql` images are Oracle
Linux based, and OL 9 ships glibc 2.34, which trips the `clone3` seccomp
constraint documented in AGENTS.md: on Docker 20.10.8 `mysql:8.0` (currently
8.0.46 / OL 9.7) fails during `--initialize` with `Can't create thread to handle
bootstrap (errno: 1)`, then restart-loops complaining the data directory is not
empty, which buries the real first error. `8.0.36` (OL 8.9, glibc 2.28) works.
Check a tag's glibc before bumping the pin:
`docker run --rm --entrypoint sh mysql:<tag> -c "ldd --version | head -1"`.

The `5.7` in the dump filename is the Navicat **source** server, not a
requirement. Every identifier is backtick-quoted (so 8.0's new reserved words
such as `rank` / `groups` / `over` are harmless), and there is no
`NO_AUTO_CREATE_USER`, no `GRANT ... IDENTIFIED BY`, no zero-dates and no
MyISAM. MySQL 5.7 has been EOL since October 2023 — do not downgrade the server
to match the filename.
:::

`api` cannot declare `depends_on` for services that live in another file, so it
starts before the schema import finishes and exits; `restart: on-failure` brings
it back until the database answers. A few restarts on the first `up` are
expected.

## Dockerfile variants

Dockerfiles live next to the code they build, inside each platform directory.
The variant is named after **whether the image compiles the source**, not after
a CLI verb.

| File                          | Compiles source? | Purpose                                             |
| ----------------------------- | ---------------- | --------------------------------------------------- |
| `<platform>/Dockerfile`       | No               | packages an already-built artifact; fails if absent |
| `<platform>/Dockerfile.build` | Yes              | self-contained multi-stage build                    |
| `<platform>/Dockerfile.dev`   | No               | dev image, source mounted, hot reload               |

The `--docker` flag of the [`mars` CLI](./cli.md) resolves the platform
directory from `platforms.json`, picks the variant matching the mode
(`dev` → `Dockerfile.dev`, `build` → `Dockerfile.build`, each falling back to the
bare `Dockerfile`), then builds and runs the container.

## Build context

The build context is **always the repository root**, so every `COPY` uses
repo-root-relative paths (e.g. `COPY apps/api/pom.xml ./`). That is what lets a
Dockerfile reach workspace-level files such as `pnpm-workspace.yaml`,
`turbo.json` and `packages/*`.

`.dockerignore` at the root controls what is sent to the daemon. It excludes
`**/target` and `**/dist`, so any artifact path consumed by the bare
`Dockerfile` must be explicitly re-included with a `!` rule placed **after**
those exclusions.

## Base image constraints

Two constraints are load-bearing. Both were reproduced on real hardware — do not
"clean them up".

### 1. Pin tags to glibc 2.31 (`-focal` / `-bullseye`)

Docker 20.10.8's default seccomp profile does not whitelist the `clone3`
syscall. Images built on glibc >= 2.34 (`jammy`, `trixie` — which is node's
*default* tag — and `amazoncorretto`) fail to create threads with `EPERM`. The
JVM misreports this as `insufficient memory ... Cannot create worker GC thread`,
which sends you hunting a non-existent memory problem.

Verified working: `maven:3.9-eclipse-temurin-17-focal`,
`eclipse-temurin:17-jre-focal`, `node:20-bullseye-slim`, `nginx:stable`, and any
`alpine` tag. `--security-opt seccomp=unconfined` also bypasses it; upgrading
Docker to 23+ removes the constraint entirely.

### 2. `apps/web-admin` must keep `css.preprocessorMaxWorkers: 0`

Vite 7 defaults to `preprocessorMaxWorkers: true`, which spawns
`availableParallelism() - 1` less worker threads. Each worker's `waitUnlock()`
uses `Atomics.wait(..., 5000)` with a **hard-coded 5s timeout** and throws
`Error("timed-out")` once it elapses. Inside a container the main thread stalls
long enough to trip this, so `vite build` fails on a **different `.less` file
every run** — which makes it look like a source bug rather than a timeout.
Setting `0` runs less in-process: slower, but deterministic.

:::tip
`vite-plugin-pwa`'s `buildEnd` hook swallows the real error message, leaving an
empty error in the build log. To see the actual cause, build an image that stops
before the build step and run `pnpm exec vite build --mode docker` manually
inside it.
:::

## Proxy

`docker.io` may be DNS-poisoned on a direct connection, in which case the Docker
daemon needs an HTTP/HTTPS proxy (Docker Desktop → Settings → Resources →
Proxies). With the proxy configured every official image pulls fine — do not
substitute third-party mirrors.
