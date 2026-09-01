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

Copy the environment template first — MySQL and Redis are **external** to the
stack:

```bash
cp .env.example .env         # then edit MYSQL_* / REDIS_* / WEB_ADMIN_PORT
```

## Two compose files

They differ only in whether the image compiles the source itself:

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

`docker-compose.build.yml` inherits from `docker-compose.yml` through the
service-level `extends` keyword, so it overrides only `build.dockerfile`.

:::warning
`extends` extends a *service*, not the project — top-level `networks:` is **not**
inherited. Every network referenced by an extended service must be re-declared
in the override file, otherwise compose fails with
`service "api" refers to undefined network <net>`. `depends_on` and
`container_name` *are* inherited and must not be repeated.
:::

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
