---
name: marsquakes-setup
description: Installs and verifies the host programs a Marsquakes project needs — Node.js, pnpm, git, the mars CLI, Docker, JDK/Maven, Rust and the Tauri system libraries — on Windows, macOS and Linux. Trigger when the user asks to set up, install, bootstrap or repair the environment, when a command fails because a program is missing, or before the first mars create / mars dev / mars build in a fresh checkout. Do not trigger for application dependency installs (pnpm install) or for writing feature code.
---

# Marsquakes Environment Setup

Install the **host programs** a Marsquakes project needs, on whatever OS the user
is on. This skill replaces the manual "go download Docker first" detour.

It installs programs, not project dependencies. `pnpm install` and `mars init`
resolve project dependencies and are not this skill's job — though `mars init` is
a reasonable thing to run once this skill reports green.

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

It prints the OS, the available system package manager, and one line per tool in
the form `OK|MISS|OLD <tool> <version>`. Parse that instead of probing tools one
at a time — it already handles the cases where a tool exists but is too old.

### 2. Decide the tool set, then ask before installing

Only install what the user's scenario needs. Installing everything is a bad
default: it puts Docker on machines that will only ever build a desktop app.

| Scenario                           | Tools                                              |
| ---------------------------------- | -------------------------------------------------- |
| Always                             | Node.js >= 22.12.0, pnpm, git, `@marsquakes/cli`   |
| Admin system (`api` + `web-admin`) | Docker Desktop / Engine **or** JDK 17 + Maven 3.9+ |
| Desktop app (`desktop`)            | Rust stable via rustup + Tauri system libraries    |
| Android                            | JDK 17 + Android SDK                               |

Ask the user which scenario they are setting up. Do not try to infer it from the
filesystem: on a bare machine there is nothing to infer from, and if a checkout
*does* happen to exist, its `platforms.json` describes that one project rather
than what the user is about to build.

If a `platforms.json` is present and the user is setting up for that specific
project, its entries with `"enabled": true` are a useful cross-check — but treat
it as a hint, not as the answer.

**Then state the plan and get confirmation.** List what will be installed, with
what command, and whether it needs administrator/sudo rights. These are
machine-wide changes; a user who wanted only Node should not silently get Docker
Desktop. Never pass an unattended-approval flag to work around a prompt.

### 3. Install

Look up each tool in `references/install-matrix.md`. It is keyed by OS and
package manager and gives the exact command.

Three rules that matter more than the commands themselves:

- **Verify a package ID before trusting it.** Registry IDs drift. Run
  `winget search <name>` / `brew info <name>` / `apt-cache policy <name>` first.
  A wrong ID fails loudly, but a *renamed* one can install something adjacent.

- **Install the language toolchains with** **`mise`**, not with the system package
  manager. Node, the JDK, Maven and Rust all come from `mise` — one tool, one file
  of pins. Distro packages for these are routinely too old for this project while
  still satisfying `command -v`, and upgrading them later fights the package
  manager. pnpm is the exception: `packageManager` pins it exactly, so it comes
  from Corepack. Everything else — git, Docker, Android Studio, the C libraries
  Tauri links against — is a system install by nature.

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

Stop there if there is no project yet. The machine being ready is this skill's
whole deliverable, and the natural next step is the user's own:

```bash
mars create my-app
```

Only if a generated project already exists, and the user asks, run its own check
from inside that directory:

```bash
mars init
```

That reports which per-platform toolchains are still missing from the
repository's point of view — a narrower question than this skill answers, and one
that needs the checkout to exist.

## Traps that produce misleading errors

Read `references/troubleshooting.md` before debugging any failure from these
tools. Four of them report the wrong cause — an old Docker's missing `clone3`
syscall surfaces as `Cannot create worker GC thread`, which reads like a memory
limit and sends you tuning heap sizes for nothing.

## Scope

Do trigger for: installing or repairing Node, pnpm, git, the `mars` CLI, Docker,
JDK, Maven, Rust, Tauri system libraries; diagnosing "command not found".

Do not trigger for: `pnpm install` and lockfile work, writing or reviewing
feature code, running dev servers, CI pipeline configuration, or installing the
AI agent itself (the agent is already running if this skill is active).
