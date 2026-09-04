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

## Version floors

Keep these in sync with `scripts/detect-env.sh` and `scripts/detect-env.ps1`, which
enforce them.

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
mise use --global node@22           # always
mise use --global java@temurin-17   # admin scenario, unless the API runs in Docker
mise use --global maven@3.9         # admin scenario, unless the API runs in Docker
mise use --global rust              # desktop scenario
```

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
| Android Studio             | A GUI IDE that manages its own SDK                                                                                               |
| MSVC, WebView2, webkit2gtk | System libraries and compilers that Tauri links against; mise installs tools, not shared libraries                               |

The dividing line is worth stating once: mise manages **language toolchains that
a project pins to a version**. It does not manage system services, GUI
applications or the C libraries a native build links against.

## pnpm — Corepack, not mise

pnpm is the one toolchain deliberately left outside mise. The repository pins an
exact pnpm version in `packageManager`, and Corepack is what reads that field, so
this lands the pinned version without anybody having to know which version that
is:

```bash
corepack enable pnpm
pnpm --version
```

Corepack ships with Node, so it is available as soon as `mise use --global
node@22` has run. Pinning pnpm a second time in mise would mean two sources of
truth for one version, and `packageManager` is the one the repository enforces.

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

For a one-off scaffold, skip the global install entirely. This also sidesteps a
stale global copy, which is the more common failure once a machine has been used
for a while:

```bash
pnpm dlx @marsquakes/cli create my-app
```

## Docker

Only needed for the admin scenario, and even there it is one of two options — see
"JDK and Maven" below.

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

The alternative to Docker for the admin scenario. Ask which one the user wants
before installing either — this is the single largest install in the matrix, and
if the API is going to run in a container the host never needs a JDK at all.

If a JDK is needed, install it with mise:

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

Desktop scenario only. There is no container fallback here — Tauri compiles
native code against the host.

**Never the distro package.** A distro-packaged `rustc` satisfies `command -v
rustc`, so it looks installed while being too old for Tauri 2. Install with mise,
which installs rustup if it is absent and then drives it — so this is the same
rustup toolchain, pinned in the same file as everything else:

```bash
mise use --global rust
```

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

Only for the `android` platform. JDK 17 as above, plus the Android SDK — most
easily via Android Studio, which manages the SDK, platform tools and an
acceptable JDK together:

| OS / pkg         | Command                                                            |
| ---------------- | ------------------------------------------------------------------ |
| Windows / winget | `winget install --id Google.AndroidStudio -e`                      |
| macOS / brew     | `brew install --cask android-studio`                               |
| Linux            | Download from developer.android.com; the distro packages lag badly |

The SDK location must be discoverable, either through `ANDROID_HOME` or through
`sdk.dir` in `local.properties`. That file is gitignored, so it is per-machine
and a fresh clone never has it.
