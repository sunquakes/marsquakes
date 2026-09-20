---
id: guide-desktop-env
title: Environment Setup
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Desktop: Environment Setup

The cross-platform desktop app in `apps/desktop` is a Tauri 2 application: a
React 19 + Vite frontend bundled with a Rust backend, storing data locally in
SQLite. One codebase produces Windows, macOS and Linux installers. Maturity:
**Ready**.

Tauri compiles native code against the host, so it needs two kinds of
prerequisites: the Rust toolchain, and each operating system's native build
tools — MSVC and WebView2 on Windows, the Xcode command line tools on macOS,
and the GTK/WebKitGTK libraries on Linux. `mars init` installs **Rust** when
`desktop` is enabled; the OS-level libraries and WebView are system packages a
version manager cannot install, so the two steps below cover them.

## Step 1 — Install the Rust toolchain (1.77.0 or newer)

The supported route is mise, which installs rustup underneath and drives it —
the same line `mars init` runs. Install mise and activate its shell hook:

<Tabs groupId="os">
<TabItem value="unix" label="macOS / Linux">

```bash
brew install mise            # macOS with Homebrew
# or, on macOS or Linux without Homebrew:
curl https://mise.run | sh

echo 'eval "$(~/.local/bin/mise activate bash)"' >> ~/.bashrc
echo 'eval "$(~/.local/bin/mise activate zsh)"'  >> ~/.zshrc
echo '~/.local/bin/mise activate fish | source'  >> ~/.config/fish/config.fish
```

</TabItem>
<TabItem value="windows" label="Windows (PowerShell)">

```powershell
winget install jdx.mise
(& mise activate pwsh) | Out-String | Invoke-Expression
```

</TabItem>
</Tabs>

Pin Rust, then open a new terminal:

```bash
mise use --global rust
```

`mise doctor` reports whether the shell hook is live. Without mise, install
rustup directly — never a distro `rustc`, which answers `command -v rustc`
while being too old for Tauri 2:

```bash
# Windows (PowerShell): winget install --id Rustlang.Rustup -e
# macOS / Linux:
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

## Step 2 — Install the system libraries and WebView {#system-libraries-and-webview}

Install these per operating system regardless of how Rust itself was installed.
On Windows, the MSVC workload matters more than the Build Tools package:
installing the package without selecting the **"Desktop development with C++"**
workload leaves no compiler, and `cargo build` then fails on a missing
`link.exe`.

<Tabs groupId="os">
<TabItem value="unix" label="macOS / Linux">

On macOS, install the Xcode command line tools (they also provide a usable
`git`):

```bash
xcode-select --install
```

On Linux, install WebKitGTK and its companion libraries through your distro's
package manager. The package set varies by distribution:

```bash
# Debian / Ubuntu (apt)
apt-get install -y libwebkit2gtk-4.1-dev build-essential curl wget file \
  libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev

# Fedora / RHEL (dnf)
dnf install -y webkit2gtk4.1-devel openssl-devel curl wget file \
  libappindicator-gtk3-devel librsvg2-devel
dnf group install -y "C Development Tools and Libraries"

# Arch (pacman)
pacman -S --noconfirm webkit2gtk-4.1 base-devel curl wget file openssl \
  appmenu-gtk-module libappindicator-gtk3 librsvg
```

The WebKitGTK package is `4.1` on current releases and `4.0` on older ones —
check with your package manager rather than guessing a name.

</TabItem>
<TabItem value="windows" label="Windows (PowerShell)">

Install the Visual Studio Build Tools, then run the installer and add the
**"Desktop development with C++"** workload:

```powershell
winget install --id Microsoft.VisualStudio.2022.BuildTools -e
```

WebView2 is preinstalled on Windows 11 and current Windows 10; install it only
if it is missing:

```powershell
winget install --id Microsoft.EdgeWebView2Runtime -e
```

</TabItem>
</Tabs>

## Next

With Rust and the native libraries in place, continue to
[Develop](./guide-desktop-develop.md).
