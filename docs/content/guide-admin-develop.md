---
id: guide-admin-develop
title: Develop
---

# Admin System: Develop

The two halves run separately: Vite serves the frontend with hot reload on port
**3100** and proxies its API calls to the backend on **8080**. Follow the steps
in order.

## Step 1 — Start the dependencies

MySQL and Redis must be running before anything else. Start them as described in
[Environment Setup → Start the dependencies](./guide-admin-env.md#start-the-dependencies).

## Step 2 — Run the Web Admin

From the repository root, either of these works (the second is a root shortcut
script):

```bash
pnpm dev --filter=web-admin
pnpm dev:web-admin
```

The Vite dev server listens on port **3100** (set by `VITE_PORT` in
`apps/web-admin/.env`), so open `http://localhost:3100`. The CLI just wraps the
same command:

```bash
mars dev --platform web-admin
```

## Step 3 — Run the API on the host

A host run needs the JDK and Maven installed as described in
[Environment Setup → JDK 17 and Maven 3.9.0](./guide-admin-env.md#jdk-and-maven);
`mars init` installs them when `api` is enabled (unless you passed `--docker`).
From the repository root:

```bash
cd apps/api && mvn -pl jeecg-module-system/jeecg-system-start -am spring-boot:run
```

`-pl` selects the starter module and `-am` builds its dependencies. The service
listens on `http://localhost:8080`, where the Web Admin dev server proxies its
API calls. Keep it in a terminal you own (`mars dev` deliberately does not wrap
it) so you can read the logs and stop it with `Ctrl+C`.

## Step 4 — (Optional) Run the API in a container

Without a host JDK or Maven, run the backend in a container instead — either
packaging an already-built jar or compiling from source in the image:

```bash
# Packages an already-built jar (fast); fails if the artifact is absent
docker compose up -d

# Compiles from source inside the image — needs no host JDK/Maven
docker compose -f docker-compose.build.yml up -d
```

Both publish port `8080:8080`. The CLI equivalent of the build-and-run path is
`mars build --platform api --docker`, covered in [Deploy](./guide-admin-deploy.md).
See [Docker](./docker.md) for the Dockerfile variants, `.env` build arguments
(`MAVEN_MIRROR_URL`) and the base-image pins that matter on a slow network or an
older Docker daemon.

## Step 5 — Learn the project layout

Frontend source lives under `apps/web-admin/src/`: `api/` for requests,
`views/` for pages, `components/`, `store/`, `router/`, `layouts/` and `hooks/`;
build config is in `build/`, mock data in `mock/`. Read `apps/web-admin/AGENTS.md`
before changing frontend code. For the backend, read `apps/api/AGENTS.md` first:
it is a multi-module Maven project, and schema plus initial data live under
`apps/api/db/` — the dump loads into MySQL 8 even though its name says 5.7, and
[Docker](./docker.md) explains why.

## Step 6 — Let an AI agent build a feature

An AI coding agent running in the repository root can add the feature while you
drive it with ordinary sentences and check the result in the browser. The full
conversation, including what to say when something looks wrong, is on the AI
track: [Admin System: Create a Feature](./ai-admin-module.md). The short version:

1. Make sure both halves from this page are running.
2. Paste the prompt below, then **wait for the plan** before approving anything.
3. When it is done, restart as it suggests, reload `http://localhost:3100`, and
   press every button yourself.

```text
I want a new feature for managing articles. Before you change anything, read
`apps/api/AGENTS.md` and `apps/web-admin/AGENTS.md`, then show me your plan and
wait for my approval.

Each article has this information:

- Title — text, required
- Author — text
- Summary — a few lines of text
- Published — a yes/no switch, defaults to no
- Publish date — a date

I need the usual management functions: a paged list with search, add, edit,
delete, batch delete, and Excel import and export. Include the standard record
fields (who created it and when, who last changed it and when). Build it the
project's standard way, following the existing features' pattern, register the
menu so it appears after I log in again, and list every file you changed.
```

A complete feature spans **both halves** — data and services under `apps/api/`,
pages and requests under `apps/web-admin/` — plus a menu registered as data; a
changed-file list touching only one half goes back. Ask for the plan first, and
do one feature at a time so the change stays separately undoable.

## Next

When the two halves run the way you want, continue to
[Deploy](./guide-admin-deploy.md).
