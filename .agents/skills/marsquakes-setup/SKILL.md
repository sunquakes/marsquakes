---
name: marsquakes-setup
description: Installs and verifies the host programs a Marsquakes project needs — Node.js, pnpm, git, the mars CLI, Docker, JDK/Maven, Rust and the Tauri system libraries — on Windows, macOS and Linux. Trigger when the user asks to set up, install, bootstrap or repair the environment, when a command fails because a program is missing, or before the first mars create / mars dev / mars build in a fresh checkout. Do not trigger for application dependency installs (pnpm install) or for writing feature code.
---

# Marsquakes Environment Setup

Install the **host programs** a Marsquakes project needs, on whatever OS the user
is on. This skill replaces the manual "go download Docker first" detour.

Its job is the **machine baseline** — the programs needed before any project
exists. The per-platform language toolchains are *not* installed here: `mars init`
derives them from the project's own `platforms.json` and installs the missing ones
itself. Splitting it that way is what keeps a desktop-only machine free of a JDK.

It does not resolve project dependencies either; `pnpm install` does that, and
`mars init` runs it.

**This skill is self-contained.** It must work on a bare machine with no
Marsquakes checkout, because preparing the machine is what comes *before* the
first `mars create`. Everything it needs is in its own directory. Never require
the repository to be present, and never read a file from it without checking
first — a missing `platforms.json` means "no project yet", which is the normal
case here, not an error.

## Workflow

Follow these five steps in order. Do not skip step 2.

### 1. Detect

Run the bundled detection script. It has no dependencies, so it works before Node
exists. Both paths are relative to **this skill's own directory**, so resolve
them from `SKILL.md`'s location rather than from the current working directory —
the CWD is wherever the user happens to be, which is usually not here:

```bash
# macOS / Linux
sh scripts/detect-env.sh
```

```powershell
# Windows
powershell -ExecutionPolicy Bypass -File scripts/detect-env.ps1
```

It prints the OS, the available system package manager, the scope it probed, and
one line per tool in the form `OK|MISS|OLD <tool> <version>`. Parse that instead
of probing tools one at a time — it already handles the cases where a tool exists
but is too old.

**By default it reports the base tools only.** That is the right scope here: a
`MISS java` line on a machine that will only ever build a desktop app invites
installing the largest item in the matrix for nothing. Pass `--scenario` (see
`--help`) only when the user has explicitly asked to prepare for a platform whose
toolchain they want up front.

### 2. Install the baseline only, and ask first

Install the **Always** row and stop. Everything below it belongs to a project, and
a project can install it for itself:

| Scenario | Tools                                            | Installed by                              |
| -------- | ------------------------------------------------ | ----------------------------------------- |
| Always   | Node.js >= 22.12.0, pnpm, git, `@marsquakes/cli` | **this skill**                            |
| `api`    | JDK 17 + Maven 3.9+ — or just Docker             | `mars init` (Docker stays manual)         |
| `desktop`| Rust stable                                      | `mars init` (Tauri system libs stay here) |
| `android`| JDK 17 + Google's `android` CLI + the Android SDK | `mars init` (all three)                 |

`mars init` reads `platforms.json`, works out which of those a project actually
needs, and installs the missing ones — with `mise` for the language toolchains,
and with Google's own installer for the `android` CLI, which has no mise plugin.
So there is nothing to ask the user about and nothing to infer from the
filesystem — installing a JDK now would at best duplicate that, and at worst put
one on a machine no project here needs it on.

The reason this split exists at all is that **right now you do not have the
information to decide.** No project exists yet, so nothing on this machine says
whether the user is heading for a desktop app or a REST API. Installing the union
of everything is not a shortcut, it is a guess — the only move available to
someone deciding too early. `mars init` runs after `mars create`, where the
project states its own platform set, so it derives the answer instead of guessing
it. Do not "save the user a step" by pulling those installs forward; that trades a
derived answer for a guess.

The same reasoning says what to do when the user comes back later having enabled
another platform: tell them to run `mars init` again. It is idempotent and
re-derives from the current `platforms.json`. An up-front install would instead be
a snapshot that quietly became wrong the moment the platform set changed.

Two items in that table stay manual because nothing available here can install
them: Docker (a system service) and the Tauri system libraries (OS packages).
`mars init` reports them and points at the matrix rather than pretending to
install them. Handle those here **only when the user asks for that platform**.

"`mise` cannot install it" and "stays manual" are not the same test, and Android
is where they come apart: mise has no plugin for either the `android` CLI or the
SDK, yet `mars init` installs both — the CLI by running Google's installer, then
the SDK by running `android sdk install` with the package set derived from
`compileSdk` in the project's own build file. So do not install either here on the
grounds that it is outside mise, and do not fall back to Android Studio for the
SDK: the question is whether `mars init` handles it, and it does.

**State the plan and get confirmation before installing.** List what will be
installed, with what command, and whether it needs administrator/sudo rights.
These are machine-wide changes; a user who wanted only Node should not silently
get Docker Desktop. Never pass an unattended-approval flag to work around a
prompt.

### 3. Install

Look up each tool in `references/install-matrix.md`. It is keyed by OS and
package manager and gives the exact command.

Three rules that matter more than the commands themselves:

- **Verify a package ID before trusting it.** Registry IDs drift. Run
  `winget search <name>` / `brew info <name>` / `apt-cache policy <name>` first.
  A wrong ID fails loudly, but a *renamed* one can install something adjacent.

- **Install the language toolchains with** **`mise`**, not with the system package
  manager. Node comes from `mise` here, and the JDK, Maven and Rust come from
  `mise` inside `mars init` — one tool, one file of pins, whichever end installs
  them. Distro packages for these are routinely too old for this project while
  still satisfying `command -v`, and upgrading them later fights the package
  manager. pnpm is the exception: `packageManager` pins it exactly, so it comes
  from Corepack. Everything else — git, Docker, the C libraries Tauri links
  against — is a system install by nature. Android Studio is no longer on that
  list: `mars init` installs the SDK itself, so the IDE is only worth installing
  when the user wants the IDE.

- **Never** **`sudo`** **a user-scoped install.** `pnpm add -g`, `rustup` and `mise`
  install into the user's home directory. Running them as root creates
  root-owned files in `$HOME` that then break the next non-root run.

### 4. Handle the shell restart honestly

Most of these installers modify `PATH` and the change does not reach the already
running shell. After installing Node, Rust or Docker:

- Tell the user to open a new terminal, and re-run the detection script there.

- Do **not** conclude the install failed because the tool is still not found in
  the current shell. That misdiagnosis leads to reinstalling something that is
  already present.

- On Linux, `docker` additionally needs `usermod -aG docker $USER` **and a full
  logout**, not just a new shell.

### 5. Verify

Re-run the detection script and show the diff against step 1. A tool that moved from
`MISS` to `OK` is the only proof that matters; an installer exiting 0 is not, as
several of them succeed while leaving nothing on `PATH`.

#### Consuming the output in scripts and CI

The script is a reporter for an interactive agent, so its **exit code is always
0 on a normal run** (only bad arguments exit non-zero). A gate must therefore
parse the lines, never the exit code. The machine-readable part of the contract
is stable in both `detect-env.sh` and `detect-env.ps1`:

- One finding per line: `OK <tool> <version>`, `OLD <tool> <version> (need >=<floor>)`,
  `MISS <tool> -`.
- `NOTE <topic> <detail>` lines are context, not findings — ignore them.
- Only the requested scope is reported: the default run covers the base tools;
  `--scenario`/`-Scenario` adds the platform probes. Gate on the tools your run
  asked for, not on every tool the script can name. Manual items (Docker, Tauri
  system libraries) should not be hard-gated in a job that does not install them.

Gate a run by requiring the `OK` lines you expect and rejecting any `MISS`/`OLD`
for the same set:

```bash
out="$(sh scripts/detect-env.sh --scenario api,desktop)"
printf '%s\n' "$out"
for t in java maven rustc cargo; do
  printf '%s\n' "$out" | grep -Eq "^OK $t " || { echo "$t not ready"; exit 1; }
done
! printf '%s\n' "$out" | grep -Eq '^(MISS|OLD) (java|maven|rustc|cargo) '
```

```powershell
$out = & scripts\detect-env.ps1 -Scenario api,desktop
$out | ForEach-Object { Write-Host $_ }
foreach ($tool in 'java','maven','rustc','cargo') {
  if ($out -notmatch "^OK $tool ") { throw "$tool not ready" }
  if ($out -match "^(MISS|OLD) $tool ") { throw "$tool missing or outdated" }
}
```

A pipeline that is meant to exercise this skill should play the same five steps
rather than approximating them: detect on the clean runner, install the baseline
exactly as the matrix says, gate the base scope, run `mars init`, then gate the
project's scenario scope. A runner image that already carries the derived
toolchains hides failures in `mars init`'s own install path, so such a job has to
hide them (sanitize `PATH`) before init; the workflow at
`.github/workflows/mars-bootstrap.yml` is the reference implementation.

Stop there if there is no project yet. The machine being ready is this skill's
whole deliverable, and the natural next step is the user's own:

```bash
mars create my-app
```

Inside a generated project, `mars init` finishes the job:

```bash
mars init
```

It installs the workspace dependencies, then reads `platforms.json` and installs
the toolchains those platforms need — so the Rust or JDK this skill deliberately
skipped arrives exactly when a project asks for it. Tell the user to run it; do
not pre-empt it by installing those toolchains here.

## Traps that produce misleading errors

Read `references/troubleshooting.md` before debugging any failure from these
tools. Four of them report the wrong cause — an old Docker's missing `clone3`
syscall surfaces as `Cannot create worker GC thread`, which reads like a memory
limit and sends you tuning heap sizes for nothing.

## Scope

Do trigger for: installing or repairing Node, pnpm, git, the `mars` CLI, Docker,
JDK, Maven, Rust, Tauri system libraries; diagnosing "command not found".

Inside an existing project, prefer `mars init` for the JDK, Maven and Rust — it
knows from `platforms.json` which of them are actually needed. Install them here
only when there is no project to derive that from, or when `mars init` has
reported one it cannot install.

There are three situations where installing everything up front **is** the right
call, and they share one trait: the platform set is already known, so nothing is
being guessed.

- **A CI runner or a Docker image.** Its purpose fixes what it builds, and baking
  the toolchains into a layer buys build-cache reuse and a run with no network.
  The Dockerfiles in this repository do exactly that.
- **An offline, air-gapped or intranet-only machine.** On-demand install assumes
  it can reach the network at `mars init` time. Here it cannot, so install while
  connectivity exists and say so explicitly.
- **Uniform fleet or classroom machines.** Per-machine variation is the thing
  being eliminated, so a fixed, identical set is the goal rather than waste.

Outside these, ask the user before pre-installing a toolchain; wanting it up
front is a legitimate answer, but it should be their answer, not your assumption.

Do not trigger for: `pnpm install` and lockfile work, writing or reviewing
feature code, running dev servers, CI pipeline configuration, or installing the
AI agent itself (the agent is already running if this skill is active).
