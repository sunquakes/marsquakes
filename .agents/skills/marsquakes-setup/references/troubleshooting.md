# Traps that report the wrong cause

Every failure catalogued here names something that is **not** the problem. The
error text points at memory, at a corrupt volume, at a missing binary, at a
denied password — and acting on it wastes time or destroys data. Read the
section that matches the symptom before changing anything. Each one gives the
literal error text, what is actually broken, and the fix.

## JVM in Docker: `Cannot create worker GC thread`

**Symptom.** A container that runs Java dies at JVM start-up:

```text
Error occurred during initialization of VM
java.lang.OutOfMemoryError: unable to create native thread
insufficient memory ... Cannot create worker GC thread
```

This reads as a memory limit, so the obvious move is to raise the Docker memory
allocation or tune `-Xmx`. Neither changes anything.

**What it actually is.** Docker 20.10.8's default seccomp profile does not
whitelist the `clone3` syscall. Images built on glibc >= 2.34 call `clone3` to
create threads and get `EPERM`. The JVM misreports that permission error as a
memory condition. Affected tags include `jammy`, `trixie` (which is node's
*default* tag) and `amazoncorretto`.

**Fix.** Pin base images to glibc 2.31, i.e. `-focal` / `-bullseye` tags.
Verified working on this machine: `maven:3.9-eclipse-temurin-17-focal`,
`eclipse-temurin:17-jre-focal`, `node:22-bullseye-slim`, `nginx:stable`, and any
`alpine` tag. Alternatives: run with `--security-opt seccomp=unconfined`, or
upgrade Docker to 23+, which removes the constraint entirely. Do not "clean up"
a pinned `-focal` / `-bullseye` tag to a floating one.

## MySQL in Docker: `Data Dictionary initialization failed`

**Symptom.** Same root cause as the section above, but an entirely different and
more misleading trail. During `--initialize`:

```text
Can't create thread to handle bootstrap (errno: 1)
Data Dictionary initialization failed.
```

The container then restart-loops on:

```text
[ERROR] --initialize specified but the data directory has files in it.
```

The restart loop buries the first error far up the log, and the surviving message
reads as a corrupt or stale volume. Deleting the volume does not help, because
the next `--initialize` fails identically.

Note that this happens **before any `/docker-entrypoint-initdb.d` script runs**,
so it is not a schema problem either.

**What it actually is.** The `mysql` images are Oracle Linux based, and Oracle
Linux 9 ships glibc 2.34 — so a floating `mysql:8.0` breaks the moment upstream
rebases. Measured here: `mysql:8.0.36` (OL 8.9, glibc 2.28) works;
`mysql:8.0.40` (OL 9.5) and `mysql:8.0` (OL 9.7, currently 8.0.46) both fail.

**Fix.** Pin the **patch** version, not `8.0` — which is what
`apps/api/db/Dockerfile` does. Before bumping the pin, check the tag's glibc:

```bash
docker run --rm --entrypoint sh mysql:<tag> -c "ldd --version | head -1"
```

## Image pulls fail or hang: `docker.io` is DNS-poisoned

**Symptom.** No official image pulls. Typical text:

```text
Error response from daemon: Get "https://registry-1.docker.io/v2/":
dial tcp: lookup registry-1.docker.io: no such host
```

Or the pull simply hangs with no progress. This looks like a bad tag, a rate
limit, or an image that no longer exists.

**What it actually is.** `docker.io` is DNS-poisoned on a direct connection in
some regions. The daemon — not the shell — is the process that resolves it, so a
proxy exported in the terminal has no effect.

**Fix.** Configure an HTTP/HTTPS proxy for the daemon under Docker Desktop >
Settings > Resources > Proxies. With the proxy configured, every official image
pulls fine.

**Do not substitute a third-party registry mirror.** The base image tags in this
repository are pinned deliberately for the glibc constraint above, and a mirror
may not carry the same ones — so the "fix" silently swaps in a tag that
reintroduces the `clone3` failure, or fails to resolve at all.

## MySQL `1045 Access denied` after editing `.env`

**Symptom.** The API cannot authenticate against a database that was working
before, or that was just brought up with a freshly chosen password:

```text
java.sql.SQLException: Access denied for user 'root'@'...' (using password: YES)
ERROR 1045 (28000): Access denied for user 'root'
```

This reads as a typo in the password, or as a host/grant problem.

**What it actually is.** MySQL bakes the root password into its data volume on
the **very first** boot and ignores `MYSQL_ROOT_PASSWORD` on every boot
afterwards. The running server still holds the password from that first start.
Editing `.env` later changes only what the *client* sends.

**Fix.** There is no in-place fix through `.env`. Delete the data volume and let
it initialise again, which destroys the data in it:

```bash
docker compose -f docker-compose.infra.yml down -v
```

Set real passwords **before** the first `up -d`, not after. Note that the
volumes in this repository carry explicit `name:` keys, so they are not prefixed
by `COMPOSE_PROJECT_NAME` — renaming the project will not give you a clean
volume as an escape hatch.

## `command not found` right after a successful install

**Symptom.** The installer exits 0, but the same shell reports:

```text
node: command not found
'pnpm' is not recognized as an internal or external command
```

**What it actually is.** The installer modified `PATH`, and the change does not
reach an already-running shell. The tool is on disk and functional.

**Fix.** Open a **new** terminal and re-run the detection script there. Compare
against the earlier output; `MISS` -> `OK` is the only proof that matters.

**The misdiagnosis to avoid:** concluding the install failed and reinstalling.
That reinstalls something already present, and on user-scoped installers
(`pnpm add -g`, `rustup`, `mise`) a retry under `sudo` additionally leaves
root-owned files in `$HOME` that break the next non-root run.

## Linux: `permission denied ... Docker daemon socket`

**Symptom.**

```text
Got permission denied while trying to connect to the Docker daemon socket at
unix:///var/run/docker.sock
```

This reads as a broken or stopped Docker install, and `sudo docker ...` working
seems to confirm that the daemon is fine and only the install is odd.

**What it actually is.** The user is not in the `docker` group, so it cannot open
the socket. The daemon is healthy.

**Fix.**

```bash
sudo usermod -aG docker $USER
```

Then **log out completely and log back in**. A new terminal is not enough —
group membership is established at login, so the new shell inherits the old
credentials and the error persists, which is easily read as the `usermod` having
failed.

## Docker installed but the daemon is not running

**Symptom.** `docker --version` and `docker compose version` both answer
correctly, so the install looks complete. The first build then fails with:

```text
Cannot connect to the Docker daemon at unix:///var/run/docker.sock.
Is the docker daemon running?
error during connect: ... The system cannot find the file specified.
```

**What it actually is.** The CLI is a separate binary from the daemon. A
version-only check cannot distinguish an installed-and-running Docker from an
installed-and-stopped one, so nothing looks wrong until a command needs the
daemon.

**Fix.** Start Docker Desktop, or `sudo systemctl start docker` on Linux, and
re-check. The detection script emits a **separate `docker-daemon` line** precisely
to distinguish these two states — `OK docker-daemon reachable` versus
`MISS docker-daemon -`. Read that line; do not infer daemon health from the
`docker` version line.

## Node too old fails as a syntax error inside a dependency

**Symptom.** `pnpm install` completes. It only prints a warning:

```text
WARN Unsupported engine: wanted: {"node":">=22.12.0"} (current: {"node":"20.11.0"})
```

The first hard failure arrives much later and much deeper, as a parse error in
`node_modules`, an unexpected token, or an empty `vite-plugin-pwa` build error —
all of which read as a broken dependency or a corrupt lockfile.

**What it actually is.** The repository does not set `engine-strict=true`, so an
unmet `engines` field is a warning rather than an install failure. The old
runtime survives install and breaks on syntax it cannot parse.

**Fix.** Install Node **>= 22.12.0**. The floor is a full version, not a major,
on purpose: Vite 7 rejects 22.0 through 22.11, so a check that compares only the
major waves those through and the failure resurfaces later inside Vite. The
detection script already compares component by component and reports this case
as `OLD node <version> (need >=22.12.0)`.

## Distro-packaged Rust is too old for Tauri 2

**Symptom.** `rustc` and `cargo` are both present and answer, so the toolchain
looks fine. `cargo build` in `src-tauri/` then fails on unrelated-looking
messages: an unsupported edition, a feature that requires a newer rustc, or a
dependency that cannot be compiled.

**What it actually is.** A distro-packaged `rustc` satisfies
`command -v rustc`, which is why a presence check passes. It is routinely older
than what Tauri 2 needs (floor tracked in the detection script as 1.77.0), and
upgrading it fights the system package manager.

**Fix.** Let rustup own the toolchain — the distro package is never the answer.
`mise use --global rust` is the route this skill uses, and it installs and drives
rustup underneath, so it is not an alternative to rustup but a way of managing
it. On a machine without mise, rustup directly:

```bash
rustup default stable
```

Do not `sudo` rustup or mise — both install into the user's home directory. Note
The detection script reports `rustup`, `rustc` and `cargo` separately: `MISS rustup`
alongside `OK rustc` is exactly this trap.

## `java -version` writes to stderr, so capture yields empty

**Symptom.** A JDK is installed and `java -version` prints correctly in the
terminal, but a script reports it as missing:

```text
MISS java -
```

The obvious conclusion — that the JDK is absent or not on `PATH` — is wrong, and
reinstalling it changes nothing.

**What it actually is.** `java -version` writes to **stderr**, not stdout. A
naive capture such as `java -version 2>/dev/null` or `$(java -version)` collects
an empty string, and an empty version string is indistinguishable from a missing
tool.

**Fix.** Redirect stderr into stdout before parsing. This is what the detection
script does:

```bash
java -version 2>&1 | head -n 1
```

Apply the same rule to any other tool that reports its version on stderr; do not
copy the `2>/dev/null` pattern used for well-behaved tools like `mvn -v`.

## Maven from mise: a pinned old patch fails with a bare 404

**Symptom.** Pinning an exact Maven patch that is not the newest one aborts with
an HTTP error that never mentions Maven:

```text
HTTP status client error (404 Not Found) for url
(https://dlcdn.apache.org/maven/maven-3/3.9.10/binaries/apache-maven-3.9.10-bin.tar.gz)
```

This reads as a broken mise registry entry, or as a network or proxy problem, so
the natural next step is retrying it or adding a mirror. Neither helps.

**What it actually is.** `dlcdn.apache.org` is Apache's *current-release* CDN and
carries only the newest release of each line. Superseded patches are moved to
`archive.apache.org`, so the URL genuinely does not exist. The version string is
valid; the download location for that version is not.

**Fix.** Pin the line rather than a superseded patch, and let it resolve to the
release Apache still publishes:

```bash
mise use --global maven@3.9
```

The 3.9.0 floor is about resolution behaviour, not a specific patch, so a line
pin satisfies it.

## Maven cannot find a JDK that `java -version` clearly shows

**Symptom.** `java -version` answers correctly, but Maven does not agree:

```text
The JAVA_HOME environment variable is not defined correctly,
this environment variable is needed to run this program.
```

Because `java` is on `PATH`, this reads as a broken Maven install or a broken
JDK, and reinstalling either changes nothing.

**What it actually is.** The JDK was installed by mise and is reachable through
**shims**, which put executables on `PATH` but **do not set environment
variables**. `JAVA_HOME` is set by `mise activate`, so without the shell hook
`java` works and Maven — which resolves its JDK through `JAVA_HOME`, not through
`PATH` — does not.

**Fix.** Install the shell hook (see the mise section of `install-matrix.md`),
then open a new terminal. `mise doctor` reports whether the hook is live.

Two related cases, both of which look like the fix did not work:

- **An IDE keeps failing after the hook is in place.** It read the environment at
  startup; restart it. For a *shell* that looks stale, `cd .` re-triggers
  `hook-env`.

- **CI or a non-interactive script has no shell to activate.** Wrap the command
  instead of relying on the environment: `mise exec -- mvn -v`, or `mise run`.
