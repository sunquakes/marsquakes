# Install Matrix

Per-OS install commands for every program this skill manages. Look up the tool,
then the row matching the `os` and `pkg` lines the detection script printed.

Two conventions apply throughout:

- **Verify the package ID before running it.** `winget search`, `brew info`,
  `apt-cache policy`. IDs drift between releases, and a *renamed* ID installs
  something adjacent instead of failing.

- **Never** **`sudo`** **a user-scoped install.** `mise`, `rustup` and `pnpm add -g`
  write into `$HOME`. Running them as root leaves root-owned files there that
  break the next non-root invocation, and the error at that point names the
  wrong command.

## Who runs which of these

Inside a project, **`mars init` already installs the language toolchains**: it
reads `platforms.json`, maps the enabled platforms to the JDK, Maven and Rust,
and runs the same `mise use --global` lines documented below for the ones that are
missing or too old. So most of this file is a reference for *what* it does rather
than a list of commands to run by hand.

| Program                             | Installed by                                    |
| ----------------------------------- | ----------------------------------------------- |
| Node.js, pnpm, git, `@marsquakes/cli` | the skill — needed before a project exists    |
| mise itself                         | the skill — `mars init` uses it but cannot install it |
| JDK, Maven, Rust                    | **`mars init`**, per `platforms.json`           |
| Android CLI + SDK                   | **`mars init`** — outside mise, via Google's installer |
| Docker, Tauri system libs           | the skill — nothing here can install these     |

Note the last two rows: `mise` installs none of those, but "outside mise" and
"manual" are different tests. The Android CLI and SDK have their own installers,
so `mars init` drives them. Docker and the Tauri system libraries have no such
route and stay with the skill.

Two consequences:

- **Install mise before handing over to `mars init`.** Without it, `mars init`
  reports the missing toolchains and points back at this file instead of
  installing anything. That is the one gap that turns an automatic install into a
  manual one.

- **Run the toolchain rows by hand only when there is no project to derive them
  from**, or when `mars init` has reported something it cannot install. Doing it
  pre-emptively puts a JDK on machines that will only ever build a desktop app.

## When installing everything up front is correct

The split above is not a rule about frugality; it is a rule about *when the
information exists*. Before `mars create` there is no `platforms.json`, so an
up-front installer cannot know what the machine is for and can only install the
union of everything. That is a guess. `mars init` runs after the project has
declared its platforms, so it derives the answer.

Read that in the other direction and the exceptions fall out. Wherever the
platform set is already fixed, up-front installation is not a guess and is the
better choice:

| Situation | Install up front, because |
| --------- | ------------------------- |
| CI runners and Docker images | The image's purpose fixes what it builds. Baking toolchains into a layer gets cache reuse and a run that needs no network. See the Dockerfiles in this repository |
| Offline, air-gapped or intranet-only machines | On-demand install assumes the network is reachable at `mars init` time. Install while it is |
| Uniform fleet or classroom machines | Identical machines are the goal; per-machine variation is what is being removed |

So do not read this file as "never install a toolchain by hand". Read it as
"install it where the decision can be made from facts rather than from a guess" —
which on a developer's own laptop means `mars init`, and in an image means the
Dockerfile.

Two costs come with the on-demand path. Both are inherent, so do not treat them
as defects to be fixed by installing earlier:

- The failure moves later. A missing toolchain now shows up during `mars init`,
  when the user thinks they are creating a project rather than setting up an
  environment.
- `PATH` needs a new shell, because a child process cannot change its parent's
  environment. This is why `mars init` ends by telling the user to open a new
  terminal, and why `JAVA_HOME` may look unset until they do.

## Version floors

Keep these in sync with `scripts/detect-env.sh`, `scripts/detect-env.ps1` and
`TOOL_SPECS` in `packages/mars-cli/bin/mars.js`, all three of which enforce them.
The CLI carries its own copy because the published package ships only `bin/`, so
it cannot shell out to these scripts.

| Tool           | Floor   | Why this number                                                        |
| -------------- | ------- | ---------------------------------------------------------------------- |
| Node.js        | 22.12.0 | Vite 7 rejects 22.0–22.11, so the floor is a full version, not a major |
| pnpm           | 9.0.0   | Pinned exactly by `packageManager` in the repository root              |
| git            | 2.20.0  | Below this, `git worktree` and partial clone behave differently        |
| Docker         | 20.10.0 | 20.10.8 is the oldest release verified here; see the `clone3` trap     |
| Docker Compose | 2.0.0   | The v1 `docker-compose` binary does not read the `extends` files       |
| JDK            | 17      | The `api` platform targets 17; 21 works, 11 does not                   |
| Maven          | 3.9.0   | Older versions resolve the repository's dependency ranges differently  |
| Rust           | 1.77.0  | Tauri 2's minimum supported toolchain                                  |
| Android CLI    | *none*  | Checked for presence only — see the `## Android` section for why       |

## mise first

Four of the programs below are language toolchains — Node.js, the JDK, Maven and
Rust — and `mise` installs all four. Use it for all four on all three platforms
rather than mixing winget, brew, apt and rustup: one tool to upgrade, one file
holding every pin, and no distro package that is too old while still satisfying
`command -v`.

Install mise itself first:

| OS / pkg           | Command                       |
| ------------------ | ----------------------------- |
| Windows / winget   | `winget install jdx.mise`     |
| Windows / scoop    | `scoop install mise`          |
| macOS / brew       | `brew install mise`           |
| macOS, Linux / any | `curl https://mise.run \| sh` |

Then pin only what the chosen scenario needs. Node is fully covered by the first
line — there is no separate Node section — and the other three lines replace the
per-OS tables in the JDK/Maven and Rust sections below:

```bash
mise use --global node@22           # always — install this one by hand
mise use --global java@temurin-17   # api or android platform; mars init runs this
mise use --global maven@3.9         # api platform; mars init runs this
mise use --global rust              # desktop platform; mars init runs this
```

The last three are exactly what `mars init` issues, for the platforms its
`platforms.json` enables. Node is the exception: `mars init` is a Node program, so
it cannot be what installs Node.

Two of those version strings are deliberate:

- **`java@temurin-17`, not `java@17`.** A bare major resolves to the OpenJDK
  vendor, whose builds are only refreshed for six months — including the LTS
  lines. After that the version keeps installing and silently stops receiving
  security patches. The vendor prefix is what makes the choice explicit, and
  Temurin matches what the fallback rows install.

- **`maven@3.9`, not an exact old patch.** Apache's CDN carries only the current
  release, so pinning a superseded patch fails with a bare `404` from
  `dlcdn.apache.org` rather than anything mentioning Maven.

`mise use --global` writes the pin to `~/.config/mise/config.toml`. Note that
`mise install` on its own installs whatever is *already* configured — it does
not read a version from the command line, so it is not a substitute for
`mise use`.

### Shell hook

`mise` needs a shell hook, or nothing it installs appears on `PATH`. The
installer script prints the line for the current shell; these are the four that
matter here:

```bash
echo 'eval "$(~/.local/bin/mise activate bash)"' >> ~/.bashrc
echo 'eval "$(~/.local/bin/mise activate zsh)"'  >> ~/.zshrc
echo '~/.local/bin/mise activate fish | source'  >> ~/.config/fish/config.fish
```

```powershell
# append to the file named by $PROFILE
(& mise activate pwsh) | Out-String | Invoke-Expression
```

Then **open a new terminal** — activation only affects shells started after it
was written. `mise doctor` reports whether the hook is live, and is the fastest
way to tell a missing hook apart from a failed install. Do not confuse it with
this skill's `detect-env` scripts: `mise doctor` only inspects mise.

### The hook is what sets `JAVA_HOME`

`mise activate` is not merely a convenience over shims. Shims put executables on
`PATH` but they **do not set environment variables**, and `JAVA_HOME` is one of
them. Maven resolves its JDK through `JAVA_HOME`, so a shims-only setup produces
a working `java -version` and a Maven that cannot find a JDK — the error blames
Java, while the missing piece is the hook.

Two consequences worth stating before they are hit:

- **An IDE reads `JAVA_HOME` at startup.** Adding the toolchain in a terminal
  does not reach an already-running IDE; restart it. If a *shell* looks stale,
  `cd .` re-triggers mise's `hook-env`.

- **In CI and in scripts there is no interactive shell to activate.** Wrap the
  command instead: `mise exec -- mvn -v`, or `mise run <task>`.

### mise does not read `.nvmrc` by default

The repository ships an `.nvmrc`, but mise **silently ignores** it unless the
idiomatic-version-file support is switched on for Node. Nothing warns about
this — the pin simply has no effect, which reads as mise having installed the
wrong version:

```bash
mise settings add idiomatic_version_file_enable_tools node
```

Without that setting, rely on the global pin from `mise use --global node@22`
and confirm with `node -v` that the result clears the 22.12.0 floor.

### What stays outside mise

Everything else in this file is installed by the system package manager, and not
because mise was not considered:

| Program                    | Why not mise                                                                                                                     |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| pnpm                       | Pinned exactly by `packageManager`; Corepack is what reads that field                                                             |
| git                        | Needed before and outside an activated shell — IDEs and GUI clients shell out to it, and a `PATH`-scoped git is invisible to them |
| Docker                     | A system daemon plus a GUI application, with post-install steps mise cannot perform: starting the service, group membership       |
| Android Studio             | A GUI IDE that manages its own SDK. Optional now — `mars init` installs the SDK without it                                        |
| Android CLI + SDK          | No mise plugin exists. Google ships an installer, and the CLI then installs the SDK, so `mars init` runs both — the automated installs not routed through mise |
| MSVC, WebView2, webkit2gtk | System libraries and compilers that Tauri links against; mise installs tools, not shared libraries                               |

The dividing line is worth stating once: mise manages **language toolchains that
a project pins to a version**. It does not manage system services, GUI
applications or the C libraries a native build links against.

The Android CLI row is the exception that does not follow from that line: it *is*
a single user-scoped binary, exactly the shape mise handles, and it stays outside
only because no plugin has been written yet. So it forms a third category rather
than joining the manual ones — mise cannot install it, but `mars init` still can,
by calling Google's installer directly. If a plugin appears, move the row up into
the mise block; nothing else about the tool would need to change.

## pnpm — Corepack, not mise

pnpm is the one toolchain deliberately left outside mise. The repository pins an
exact pnpm version in `packageManager`, and Corepack is what reads that field, so
this lands the pinned version without anybody having to know which version that
is:

```bash
corepack enable pnpm
mise reshim node
pnpm --version
```

Corepack ships with Node, so it is available as soon as `mise use --global
node@22` has run, but `corepack enable` writes the `pnpm` link into Node's own
bin directory (`~/.local/share/mise/installs/node/<version>/bin`), not into
mise's shim directory. In an interactive shell that bin dir is on `PATH`, so
the link resolves on its own; in a non-interactive context (CI, `BASH_ENV`)
`mise activate` exposes only `~/.local/share/mise/shims`, and the new link is
not indexed until `mise reshim node` rebuilds the shims. Always reshim right
after enabling pnpm so both contexts behave identically. Pinning pnpm a second
time in mise would mean two sources of truth for one version, and
`packageManager` is the one the repository enforces.

**Do not `npm i -g pnpm` alongside Corepack.** Two pnpm installations on `PATH`
resolve unpredictably, and the loser is usually the pinned one.

## git

| OS / pkg         | Command                                       |
| ---------------- | --------------------------------------------- |
| Windows / winget | `winget install --id Git.Git -e`              |
| macOS / brew     | `brew install git`                            |
| macOS / none     | `xcode-select --install` — ships a usable git |
| Linux / apt      | `apt-get install -y git`                      |
| Linux / dnf, yum | `dnf install -y git`                          |
| Linux / pacman   | `pacman -S --noconfirm git`                   |
| Linux / apk      | `apk add git`                                 |

## Marsquakes CLI

Needs Node and pnpm first. The package is scoped; the command it installs is not:

```bash
pnpm add -g @marsquakes/cli
mars --help
```

pnpm places global executables in `PNPM_HOME` and refuses the install when that
directory is not on the current shell's `PATH`. Run `pnpm setup` once and open
a new shell so it is exported permanently, or for a single non-interactive
session export both explicitly:

```bash
export PNPM_HOME="$HOME/.local/share/pnpm"
export PATH="$PNPM_HOME:$PATH"
```

For a one-off scaffold, skip the global install entirely. This also sidesteps a
stale global copy, which is the more common failure once a machine has been used
for a while:

```bash
pnpm dlx @marsquakes/cli create my-app
```

## Docker

Only needed for the `api` platform, and even there it is one of two options — see
"JDK and Maven" below. It is a system service, so `mars init` reports it as
missing rather than installing it; this section is what it points at.

| OS / pkg         | Command                                                                                                              |
| ---------------- | -------------------------------------------------------------------------------------------------------------------- |
| Windows / winget | `winget install --id Docker.DockerDesktop -e`                                                                        |
| macOS / brew     | `brew install --cask docker`                                                                                         |
| Linux / any      | `curl -fsSL https://get.docker.com \| sh`                                                                            |
| Linux / apt      | Follow docs.docker.com for the apt repository; `docker.io` in the distro repo is old enough to hit the `clone3` trap |

Three things must happen after the install, and none of them are optional:

1. **Start the daemon.** Docker Desktop does not start itself after installing.
   Until it runs, `docker --version` succeeds and every real command fails.

2. **Linux only — join the** **`docker`** **group**, then log out completely. A new shell
   is not enough because group membership is established at login:

   ```bash
   sudo usermod -aG docker "$USER"
   ```

3. **Confirm the daemon answers**, not just that the client exists:

   ```bash
   docker info
   ```

On networks where `docker.io` resolves incorrectly, configure an HTTP/HTTPS proxy
in Docker Desktop → Settings → Resources → Proxies. Do not switch to a
third-party registry mirror: the image tags used here are pinned deliberately and
a mirror may not carry those exact tags. See `troubleshooting.md`.

## JDK and Maven

The alternative to Docker for the `api` platform. This is the single largest
install in the matrix, and if the API is going to run in a container the host
never needs a JDK at all.

**`mars init` decides this for you**, and the rule it applies is narrower than
"api implies Docker or a JDK": it skips a toolchain only when Docker is already
working **and no other enabled platform claims it**. So an `api`-only project with
Docker installs neither, while `api` + `android` still installs the JDK — Gradle
runs on the host — and skips only Maven.

If a JDK is needed outside a project, install it with mise:

```bash
mise use --global java@temurin-17
mise use --global maven@3.9
```

The table below is the **fallback**, for a machine that will not run mise — a
locked-down corporate image, or a JDK that a separate team already manages:

| OS / pkg         | JDK 17                                                  | Maven                                 |
| ---------------- | ------------------------------------------------------- | ------------------------------------- |
| Windows / winget | `winget install --id EclipseAdoptium.Temurin.17.JDK -e` | `winget install --id Apache.Maven -e` |
| macOS / brew     | `brew install --cask temurin@17`                        | `brew install maven`                  |
| Linux / apt      | `apt-get install -y openjdk-17-jdk`                     | `apt-get install -y maven`            |
| Linux / dnf, yum | `dnf install -y java-17-openjdk-devel`                  | `dnf install -y maven`                |
| Linux / pacman   | `pacman -S --noconfirm jdk17-openjdk`                   | `pacman -S --noconfirm maven`         |
| Linux / apk      | `apk add openjdk17`                                     | `apk add maven`                       |

Do not combine the two paths. A mise-managed JDK and a system JDK both answer
`java -version`, and which one wins depends on `PATH` order, so the build ends up
compiling against a JDK nobody chose.

Whichever path is used, install the **JDK**, not the JRE. A JRE runs the packaged
jar but cannot build it, and the failure appears as a missing compiler rather
than a missing JDK. On Linux that is what the `-devel` / `-jdk` suffixes mean.

`JAVA_HOME` is the other thing to get right, and it differs per path: mise sets
it from the shell hook (see above), while the fallback tables leave it to the
installer — winget's Temurin package sets it, most others do not.

## Rust and Tauri

For the `desktop` platform only. There is no container fallback here — Tauri
compiles native code against the host.

**Never the distro package.** A distro-packaged `rustc` satisfies `command -v
rustc`, so it looks installed while being too old for Tauri 2. Install with mise,
which installs rustup if it is absent and then drives it — so this is the same
rustup toolchain, pinned in the same file as everything else:

```bash
mise use --global rust
```

`mars init` runs exactly that line when `desktop` is enabled. The system packages
further down are the part it cannot install.

Because rustup is underneath, the toolchain does not live under mise's usual
`installs` directory; mise keeps a symlink and sets `RUSTUP_TOOLCHAIN`. An
existing rustup install is respected through `RUSTUP_HOME` / `CARGO_HOME`.

Direct rustup remains the fallback where mise is not wanted:

| OS / pkg           | Command                                                           |
| ------------------ | ----------------------------------------------------------------- |
| Windows / winget   | `winget install --id Rustlang.Rustup -e`                          |
| macOS, Linux / any | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` |

Then the platform prerequisites Tauri links against. These are **system**
packages — C compilers, system webviews, shared libraries — so mise has nothing
to do with them and they are installed per-OS regardless of the choice above:

| OS             | Requirement              | Command                                                                                                                                                                 |
| -------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Windows        | MSVC build tools         | `winget install --id Microsoft.VisualStudio.2022.BuildTools -e` — then add the "Desktop development with C++" workload                                                  |
| Windows        | WebView2 runtime         | Preinstalled on Windows 11 and current Windows 10; otherwise `winget install --id Microsoft.EdgeWebView2Runtime -e`                                                     |
| macOS          | Xcode command line tools | `xcode-select --install`                                                                                                                                                |
| Linux / apt    | webkit2gtk + friends     | `apt-get install -y libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev`                               |
| Linux / dnf    | webkit2gtk + friends     | `dnf install -y webkit2gtk4.1-devel openssl-devel curl wget file libappindicator-gtk3-devel librsvg2-devel && dnf group install -y "C Development Tools and Libraries"` |
| Linux / pacman | webkit2gtk + friends     | `pacman -S --noconfirm webkit2gtk-4.1 base-devel curl wget file openssl appmenu-gtk-module libappindicator-gtk3 librsvg`                                                |

The MSVC workload matters more than the Build Tools package: installing the
package without selecting a workload leaves no compiler, and `cargo build` then
fails on a missing `link.exe` rather than on a missing installation.

The webkit2gtk package name is the part that varies most between distributions
and releases (`4.1` on current releases, `4.0` on older ones). Search before
installing rather than guessing; a wrong name here fails loudly, which is fine,
but guessing repeatedly wastes the user's confirmation each time.

## Android

Only for the `android` platform, and it needs three separate things. `mars init`
installs all three, the SDK included.

### JDK — installed by `mars init`

The `java@temurin-17` line from the mise block above. Gradle runs on the *host*,
so the JDK is required even on a machine that has the Android CLI: the CLI is
additive, never a substitute. This is why `add_scenario()` in both detection
scripts sets `want_java` **and** `want_android_cli` for `android`.

### Android CLI — installed by `mars init`, outside mise

Google's agent-first `android` CLI, not the SDK's `sdkmanager` / `avdmanager`. It
is a single user-scoped binary and needs no admin rights. `mars init` downloads
Google's own installer and runs it, because mise has no plugin for the tool:

| OS      | Installer                                                    | Lands in                              |
| ------- | ------------------------------------------------------------ | ------------------------------------- |
| Windows | `install.cmd`, `PATH` written to `HKCU\Environment`           | `%USERPROFILE%\AppData\AndroidCLI`    |
| macOS   | `install.sh`, `export PATH=…` appended to a shell profile     | `$HOME/.local/bin`                    |
| Linux   | `install.sh`, `export PATH=…` appended to a shell profile     | `$HOME/.local/bin`                    |

Binaries live under `https://dl.google.com/android/cli/latest/<triple>/`. Only
four triples exist, and the names do not follow the pattern one would guess —
these were confirmed by HTTP HEAD, so do not "correct" them:

| Verified (200)                                        | Guessed, and 404                                     |
| ----------------------------------------------------- | ---------------------------------------------------- |
| `windows_x86_64`, `darwin_arm64`, `darwin_x86_64`, `linux_x86_64` | `mac_arm64`, `mac_x86_64`, `linux_arm64`, `linux_aarch64` |

`linux_arm64` being absent is the one that matters in practice: an ARM Linux host
cannot install this tool, and `mars init` says so rather than downloading a
binary that will not execute.

Three properties of the tool shape how the rest of the repository treats it:

- **No version floor.** `android -V` has no published version contract and may
  print a build string with no dotted number in it. Both detection scripts
  therefore report it by *presence* — `OK android-cli present` — instead of
  routing it through `report` / `Write-Report`, which would extract an empty
  version and announce a working install as `MISS`.

- **`android emulator` is disabled on Windows** by Google, so a bare `OK` there
  would overstate what works. Both scripts emit `NOTE android-emulator
  disabled-on-windows` alongside the `OK`, and `mars init` prints the same
  caveat after installing.

- **`PATH` needs a new terminal.** Both installers write `PATH` into a profile or
  the registry, neither of which reaches the already-running shell. This is the
  general `mars init` caveat from the top of this file, not something specific to
  Android.

### Android SDK — installed by `mars init`

`android sdk install` makes the SDK part of the automated path, so Android Studio
is no longer required to obtain one. `mars init` runs it after the CLI install,
because the CLI is what performs the download — the ordering is a dependency, not
a preference.

**The package set is derived from the project, not pinned here.** `compileSdk` is
read out of `apps/android/app/build.gradle.kts` and expanded to three packages:

| Package                  | Where the version comes from                                  |
| ------------------------ | ------------------------------------------------------------- |
| `platforms/android-<N>`  | `compileSdk` in the app's build file                          |
| `build-tools/<N>.0.0`    | paired with `compileSdk`, as the project declares no `buildToolsVersion` |
| `platform-tools`         | unversioned; one per SDK                                      |

Two `compileSdk` syntaxes are accepted, because AGP changed it: the block form
`compileSdk { version = release(36) }` used by this project, and the classic
scalar `compileSdk = 36`. Matching only one fails *silently* — it derives an empty
package set rather than raising — so both are parsed, and a build file with
neither is reported and skipped.

**Location.** An existing `ANDROID_HOME` / `ANDROID_SDK_ROOT` wins, so a machine
that already has an SDK does not get a second one. Otherwise the conventional
per-OS path is used — the same one Android Studio picks, so the two share an SDK
instead of maintaining one each:

| OS      | Default SDK location            |
| ------- | ------------------------------- |
| Windows | `%LOCALAPPDATA%\Android\Sdk`    |
| macOS   | `$HOME/Library/Android/sdk`     |
| Linux   | `$HOME/Android/Sdk`             |

The path is passed explicitly as `android --sdk="<path>" sdk install …` rather
than read back out of `android info`, so the value that reaches
`local.properties` is one we chose, not one parsed out of human-readable output
whose shape is not a contract. Note `--sdk` is a *global* flag and must precede
the subcommand.

**Discovery.** Gradle finds the SDK through `ANDROID_HOME` or through `sdk.dir` in
`apps/android/local.properties`. A child process cannot set an environment
variable in the parent shell, so the file is the only channel that works within
the same run — `mars init` writes `sdk.dir` there, with backslashes doubled
because Java `.properties` treats one as an escape. An existing `sdk.dir` is
**never** rewritten: the file is gitignored and per-machine, so the user may be
pointing it somewhere deliberately.

**When it is skipped.** No CLI on the host and no successful CLI install this run
(an ARM Linux host, for instance, where no binary exists) means there is nothing
to install with. `mars init` says so and exits 0; running it again once the CLI is
present completes the job. Note the freshly installed CLI *is* found within the
same run — it is located by absolute path, not by the stale `PATH` of the running
process.

**Android Studio remains a valid manual route**, and the easier one if the user
wants the IDE anyway, since it manages the SDK, platform tools and an acceptable
JDK together:

| OS / pkg         | Command                                                            |
| ---------------- | ------------------------------------------------------------------ |
| Windows / winget | `winget install --id Google.AndroidStudio -e`                      |
| macOS / brew     | `brew install --cask android-studio`                               |
| Linux            | Download from developer.android.com; the distro packages lag badly |
