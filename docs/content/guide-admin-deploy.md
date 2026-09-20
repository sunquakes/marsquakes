---
id: guide-admin-deploy
title: Deploy
---

# Admin System: Deploy

Each half is packaged its own way: the Web Admin is a static build that nginx
serves, and the API is a Spring Boot jar that runs in a JRE container. Follow
the steps in order.

## Step 1 — Build the Web Admin

```bash
pnpm build --filter=web-admin
# or the shortcut
pnpm build:web-admin
```

`mars build --platform web-admin` runs the same workspace build.

### Serve it in a container

To build and serve the result inside a container instead of on the host:

```bash
mars build --platform web-admin --docker
```

The container publishes the app on port `${WEB_ADMIN_PORT:-8807}` (8807 by
default, mapped to port 80 inside nginx), which is deliberately different from
the dev server's 3100. See [Docker](./docker.md) for the Dockerfile variants
and the `NPM_REGISTRY` build argument that matters on a slow network.

## Step 2 — Build and run the API in a container

The CLI builds the image from source and runs it:

```bash
mars build --platform api --docker
```

The equivalent compose invocation compiles inside the image and needs no host
JDK or Maven:

```bash
docker compose -f docker-compose.build.yml up -d
```

Both publish port `8080:8080` and expect MySQL and Redis to already be running —
start them with `docker compose -f docker-compose.infra.yml up -d` (see
[Environment Setup](./guide-admin-env.md#start-the-dependencies)). The
[Docker](./docker.md) page covers the Dockerfile variants, `.env` build
arguments (`MAVEN_MIRROR_URL`) and the base-image pins that matter on a slow
network or an older Docker daemon.

## Next

For workspace-wide `mars dev`, `mars build` and `mars clean`, see
[Start a Project](./create-project.md#run-and-build-the-project). The
[Docker](./docker.md) reference has the full container workflow.
