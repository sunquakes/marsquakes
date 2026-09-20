---
id: guide-admin-env
title: Environment Setup
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Admin System: Environment Setup

An admin system is a **matching pair**: the Vue 3 + Vite site in
`apps/web-admin` (pure Node/pnpm) and the Spring Boot backend in `apps/api` (a
multi-module Maven project, **not** a pnpm workspace member), backed by MySQL and
Redis in containers. Both halves are **Ready**.

With both platforms selected, `mars init` installs everything below except Docker,
which it only **reports** (a system daemon, not a language toolchain). The steps
below are the manual route when you do not run `mars init` or it reports something
it cannot install.

## Prerequisites

| Tool | Floor | Needed for |
| ---- | ----- | ---------- |
| Node.js | 22.12.0 | the web-admin dev server and build |
| pnpm | 9.0.0 | workspace dependencies and scripts |
| Docker | ≥ 20.10.0 with Compose ≥ 2.0.0 | MySQL and Redis — always required |
| JDK | 17 (Temurin) | running or building the API on the host |
| Maven | 3.9.0 | running or building the API on the host |

The JDK and Maven rows are **host run only**: if the API runs inside a container,
the host needs neither (`mars init --docker` skips them).

## Step 1 — Verify Node and pnpm

From the repository root:

```bash
node -v
pnpm --version
```

If either is missing or too old, follow [Environment Setup](./install.md)
(Node through mise, pnpm through Corepack).

## Step 2 — Install Docker {#docker}

Docker is always required, because MySQL and Redis run in containers. Install it
for your operating system:

<Tabs groupId="os">
<TabItem value="windows" label="Windows (PowerShell)">

```powershell
winget install --id Docker.DockerDesktop -e
```

</TabItem>
<TabItem value="unix" label="macOS / Linux">

On macOS with Homebrew:

```bash
brew install --cask docker
```

On Linux, use the convenience script (or follow docs.docker.com to add Docker's
own apt repository — the distro's `docker.io` package is too old):

```bash
curl -fsSL https://get.docker.com | sh
```

</TabItem>
</Tabs>

Then, in order:

1. **Start the daemon.** Launch Docker Desktop (Windows, macOS) or start the
   service (Linux). Until it runs, `docker --version` succeeds while every real
   command fails.
2. **Linux only — join the `docker` group, then log out completely** (a new
   shell is not enough, because group membership is established at login):

   ```bash
   sudo usermod -aG docker "$USER"
   ```

3. **Confirm the daemon answers**, not just that the client exists:

   ```bash
   docker info
   ```

You need Docker ≥ 20.10.0 with Compose ≥ 2.0.0. If `docker.io` resolves incorrectly,
configure an HTTP/HTTPS proxy in Docker Desktop → Settings → Resources → Proxies
rather than using a third-party mirror; the [Docker](./docker.md) page explains
why.

### JDK 17 and Maven 3.9.0 (host run only) {#jdk-and-maven}

Skip this whole section if the API runs only in containers. With mise installed
(see [Environment Setup](./install.md)), pin both in one step — these are the
same lines `mars init` runs:

```bash
mise use --global java@temurin-17
mise use --global maven@3.9
```

Then open a new terminal — the mise shell hook puts the tools on `PATH` and sets
`JAVA_HOME` (check with `mise doctor`). The `temurin-17` prefix is deliberate
(a bare `java@17` stops getting security patches); Apache's CDN carries only the
current release, so `maven@3.9` is required.

If mise cannot run (a locked-down corporate image, a JDK managed by another
team), use a system package instead — do not mix the two, or the build binds to
whichever JDK wins on `PATH`:

| OS / pkg | JDK 17 | Maven |
| -------- | ------ | ----- |
| Windows / winget | `winget install --id EclipseAdoptium.Temurin.17.JDK -e` | `winget install --id Apache.Maven -e` |
| macOS / brew | `brew install --cask temurin@17` | `brew install maven` |
| Linux / apt | `apt-get install -y openjdk-17-jdk` | `apt-get install -y maven` |
| Linux / dnf, yum | `dnf install -y java-17-openjdk-devel` | `dnf install -y maven` |
| Linux / pacman | `pacman -S --noconfirm jdk17-openjdk` | `pacman -S --noconfirm maven` |

Install the **JDK**, not the JRE (the JRE cannot compile; on Linux that is the
`-jdk` / `-devel` suffix). JDK 21 also works; JDK 11 does not. winget's Temurin
sets `JAVA_HOME` itself; most other installers do not.

## Step 3 — Start MySQL and Redis {#start-the-dependencies}

The databases run in containers, even when the API itself runs on the host:

```bash
docker compose -f docker-compose.infra.yml up -d
```

This starts MySQL on host port `${MYSQL_HOST_PORT:-3306}` and Redis on
`${REDIS_HOST_PORT:-6379}`. Connection details, passwords and port overrides live
in `.env`; see [Docker](./docker.md#base-services) for the full service table.

:::note
If `docker` is not found or the command cannot connect to the daemon, install and
start Docker first — see [Step 2](#docker) above.
:::

## Next

With the containers up and — for a host run — the JDK and Maven installed,
continue to [Develop](./guide-admin-develop.md).
