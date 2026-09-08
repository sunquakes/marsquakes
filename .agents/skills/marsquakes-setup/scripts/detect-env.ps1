# Marsquakes environment detection - native Windows PowerShell.
#
# Reports only. Installing is the caller's job (see references/install-matrix.md),
# which is why this is not called `doctor`: nothing here repairs anything.
#
# Dependency-free on purpose. This runs *before* Node.js exists, so it cannot be
# a Node script, and it must not assume anything newer than the PowerShell 5.1
# that ships with Windows 10/11 - PowerShell 7 is itself something the operator
# may still have to install.
#
# Output contract, one item per line:
#
#   os windows
#   arch <x86_64|arm64|...>
#   pkg <winget|choco|scoop|none>
#   scope <base|base,docker,java,maven|...>
#   OK   <tool> <version>
#   OLD  <tool> <version> (need >=<floor>)
#   MISS <tool> -
#   NOTE <topic> <detail>
#
# NOTE is not a finding and needs no action: it qualifies a preceding OK where
# "installed" and "fully usable" differ. Today only `android emulator`, which
# Google disables on Windows, so a bare `OK android-cli` would overstate it. A
# parser that does not recognise NOTE must ignore the line rather than fail.
#
# Parse this instead of probing tools one at a time: OLD is the case that a
# plain `Get-Command` check reports as present, and it is the most common reason
# a build fails after "everything is installed".
#
# Usage:
#   .\detect-env.ps1                          # base tools only (default)
#   .\detect-env.ps1 -Scenario admin          # base + Docker/JDK/Maven
#   .\detect-env.ps1 -Scenario admin,desktop
#   .\detect-env.ps1 -Scenario all            # everything this script knows about
#
# The flag is spelled `-Scenario` here and `--scenario` in detect-env.sh. That is
# not an oversight: PowerShell binds parameters from a single dash and reads
# `--scenario` as a positional string, so a POSIX-style spelling would silently
# fail to bind. The output contract above is what the two scripts keep identical.
#
# The default is deliberately narrow. Reporting `MISS docker` and `MISS java` on
# a machine that will only ever build a desktop app invites installing both, and
# the JDK is the largest install in the matrix. Ask for a scenario only once the
# project actually needs it - `mars init` derives that from platforms.json.

param(
  # Accepts both `-Scenario admin,desktop` (PowerShell binds two elements) and
  # `-Scenario 'admin,desktop'` (one element, split below), so a caller that
  # forwards a comma-joined string it got from elsewhere does not have to know
  # which form this script prefers.
  [string[]]$Scenario = @(),
  [switch]$Help
)

# A missing tool must never surface as a PowerShell error: the whole point of
# this script is to report absence as data, on stdout, in the contract above.
$ErrorActionPreference = 'SilentlyContinue'
$ProgressPreference = 'SilentlyContinue'

# Keep these in sync with the floors documented in references/install-matrix.md.
# The Node floor is a full version, not a major: Vite 7 refuses anything below
# 22.12.0 on the 22 line, so comparing majors only would wave 22.0-22.11 through
# and the failure would surface much later, inside Vite.
$REQ_NODE = '22.12.0'
$REQ_PNPM = '9.0.0'
$REQ_GIT = '2.20.0'
$REQ_JAVA = '17'
$REQ_MAVEN = '3.9.0'
$REQ_DOCKER = '20.10.0'
$REQ_COMPOSE = '2.0.0'
$REQ_RUST = '1.77.0'

# --- scenario selection ------------------------------------------------------

# The base tools are always reported: without Node, pnpm and git nothing works
# at all, regardless of which platforms a project enables.
#
# Everything else is opt-in per *tool group* rather than per scenario, because
# the scenarios do not partition cleanly. Android needs a JDK but drives it with
# Gradle, so probing Maven would report a miss that never matters; the native
# windows/linux/macos platforms are not Tauri, so they need no Rust.
$want_docker = $false
$want_java = $false
$want_maven = $false
$want_rust = $false
$want_android_cli = $false

function Add-Scenario {
  param([string]$Name)
  switch ($Name) {
    'base' { }
    # `admin` and `desktop` are the scenario names used by
    # references/install-matrix.md. `desktop` doubles as the Tauri platform name
    # in platforms.json, which is why one branch serves both.
    'admin' { $script:want_docker = $true; $script:want_java = $true; $script:want_maven = $true }
    'desktop' { $script:want_rust = $true }
    'all' { $script:want_docker = $true; $script:want_java = $true; $script:want_maven = $true; $script:want_rust = $true; $script:want_android_cli = $true }
    # Platform names, so a caller can forward platforms.json entries verbatim
    # instead of maintaining its own platform-to-tool mapping. `mars init` does
    # exactly that.
    'api' { $script:want_docker = $true; $script:want_java = $true; $script:want_maven = $true }
    # The Android CLI is additive, not a substitute for the JDK: Gradle still
    # runs on the host, so a machine with the CLI but no JDK cannot build.
    'android' { $script:want_java = $true; $script:want_android_cli = $true }
    # web / web-admin need only the base tools. ios and the native
    # windows/linux/macos targets build with their own OS toolchain (Xcode, MSVC,
    # gcc), which this script cannot meaningfully version-check.
    'web' { }
    'web-admin' { }
    'ios' { }
    'windows' { }
    'linux' { }
    'macos' { }
    default {
      # Not Write-Error: the script-wide 'SilentlyContinue' would swallow it, and
      # a redirection suffix such as `>&2` binds to the *pipeline*, not to
      # Write-Output, so it cannot be used inside a switch branch. Writing to the
      # error stream directly is unaffected by either.
      [Console]::Error.WriteLine("detect-env: unknown scenario '$Name'")
      exit 2
    }
  }
}

# The header block above doubles as the help text, the same way detect-env.sh
# prints its own leading comments. Stop at the first non-comment line so the
# per-tool comments further down are not appended.
if ($Help) {
  foreach ($line in Get-Content -LiteralPath $PSCommandPath) {
    if ($line -notmatch '^#') { break }
    Write-Output ($line -replace '^# ?', '')
  }
  exit 0
}

# Each element may itself be comma-joined, so split unconditionally: this accepts
# `-Scenario admin,desktop` and `-Scenario 'admin,desktop'` identically.
foreach ($item in $Scenario) {
  foreach ($part in ($item -split ',')) {
    $trimmed = $part.Trim()
    if ($trimmed) { Add-Scenario $trimmed }
  }
}
# When $Scenario is empty (the default), every flag stays $false = base only.

function Test-Have {
  param([string]$Name)
  return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

# First dotted number in the input, e.g. `Apache Maven 3.9.6 (abc)` -> `3.9.6`.
function Get-FirstVersion {
  param([string]$Text)
  if (-not $Text) { return '' }
  $m = [regex]::Match($Text, '[0-9]+(\.[0-9]+)*')
  if ($m.Success) { return $m.Value }
  return ''
}

# Runs a tool only when it exists, so absence yields an empty string rather than
# a CommandNotFoundException. stderr is folded into stdout because several tools
# print their version there - `java -version` is the notorious one.
#
# The local $ErrorActionPreference is not redundant: under 'SilentlyContinue',
# PowerShell 5.1 *discards* native stderr redirected with 2>&1 instead of merging
# it, so the script-wide setting would silently reduce `java -version` to an empty
# string and report a working JDK as MISS. Restoring 'Continue' for the call keeps
# the merge working, and being function-local it does not resurrect the errors the
# script-wide setting exists to suppress.
function Get-ToolVersion {
  param([string]$Exe, [string[]]$Arguments = @())
  if (-not (Test-Have $Exe)) { return '' }
  $ErrorActionPreference = 'Continue'
  try {
    $raw = & $Exe @Arguments 2>&1 | Out-String
  } catch {
    return ''
  }
  return (Get-FirstVersion $raw)
}

# Returns $true when $Version < $Floor. Compares component by component so that
# 1.10.0 sorts above 1.9.0, which a string comparison gets wrong. Trailing build
# metadata is tolerated because each component is parsed as a leading number:
# `9+7` reads as 9.
function Test-Older {
  param([string]$Version, [string]$Floor)
  $a = $Version -split '\.'
  $b = $Floor -split '\.'
  $n = [Math]::Max($a.Count, $b.Count)
  for ($i = 0; $i -lt $n; $i++) {
    $ai = 0; $bi = 0
    if ($i -lt $a.Count) { [void][int]::TryParse(($a[$i] -replace '[^0-9].*$', ''), [ref]$ai) }
    if ($i -lt $b.Count) { [void][int]::TryParse(($b[$i] -replace '[^0-9].*$', ''), [ref]$bi) }
    if ($ai -lt $bi) { return $true }
    if ($ai -gt $bi) { return $false }
  }
  return $false
}

function Write-Report {
  param([string]$Tool, [string]$Version, [string]$Floor = '')
  if (-not $Version) {
    Write-Output "MISS $Tool -"
  } elseif ($Floor -and (Test-Older $Version $Floor)) {
    Write-Output "OLD $Tool $Version (need >=$Floor)"
  } else {
    Write-Output "OK $Tool $Version"
  }
}

# --- context -----------------------------------------------------------------

Write-Output 'os windows'

$arch = 'unknown'
switch ("$env:PROCESSOR_ARCHITECTURE") {
  'AMD64' { $arch = 'x86_64' }
  'ARM64' { $arch = 'arm64' }
  'x86' { $arch = 'i686' }
}
Write-Output "arch $arch"

# Probed in preference order: winget is in-box on current Windows, choco is the
# most common pre-existing installer, scoop the fallback that needs no admin.
$pkg = 'none'
foreach ($candidate in 'winget', 'choco', 'scoop') {
  if (Test-Have $candidate) { $pkg = $candidate; break }
}
Write-Output "pkg $pkg"

# Tells the caller which groups this run actually looked at, so an absent tool
# can be distinguished from an unasked-for one. A missing group is not a finding.
$scope = 'base'
if ($want_docker) { $scope += ',docker' }
if ($want_java) { $scope += ',java' }
if ($want_maven) { $scope += ',maven' }
if ($want_rust) { $scope += ',rust' }
if ($want_android_cli) { $scope += ',android-cli' }
Write-Output "scope $scope"

# --- always required ---------------------------------------------------------

# mise installs Node, the JDK, Maven and Rust here, so `MISS mise` is usually the
# single cause behind several of the misses below rather than a separate finding.
# No floor: any mise can install a pinned toolchain.
Write-Report 'mise' (Get-ToolVersion 'mise' @('--version'))

Write-Report 'node' (Get-ToolVersion 'node' @('-v')) $REQ_NODE
Write-Report 'pnpm' (Get-ToolVersion 'pnpm' @('--version')) $REQ_PNPM
Write-Report 'git' (Get-ToolVersion 'git' @('--version')) $REQ_GIT
Write-Report 'mars' (Get-ToolVersion 'mars' @('--version'))

# Corepack ships with Node and is how pnpm is meant to be enabled here, so its
# absence explains a missing pnpm rather than being a separate problem.
Write-Report 'corepack' (Get-ToolVersion 'corepack' @('--version'))

# --- admin scenario ----------------------------------------------------------

if ($want_docker) {
  Write-Report 'docker' (Get-ToolVersion 'docker' @('--version')) $REQ_DOCKER
  Write-Report 'docker-compose' (Get-ToolVersion 'docker' @('compose', 'version')) $REQ_COMPOSE

  # An installed Docker whose daemon is not running looks identical to a working
  # one until the first build, so check reachability separately. On Windows this
  # is the single most likely failure: Docker Desktop is installed but its engine
  # was never started after a reboot.
  if (Test-Have 'docker') {
    $daemon = $false
    try {
      & docker info 2>$null | Out-Null
      $daemon = ($LASTEXITCODE -eq 0)
    } catch {
      $daemon = $false
    }
    if ($daemon) {
      Write-Output 'OK docker-daemon reachable'
    } else {
      Write-Output 'MISS docker-daemon -'
    }
  }
}

if ($want_java) {
  Write-Report 'java' (Get-ToolVersion 'java' @('-version')) $REQ_JAVA
}

if ($want_maven) {
  Write-Report 'maven' (Get-ToolVersion 'mvn' @('-v')) $REQ_MAVEN
}

# --- android scenario --------------------------------------------------------

# Google's agent-first `android` CLI, not the SDK's sdkmanager/avdmanager. It is
# a single user-scoped binary in %USERPROFILE%\AppData\AndroidCLI, installed by
# `mars init` from Google's own installer -- see references/install-matrix.md.
#
# Reported by presence rather than through Write-Report, because `android -V` has
# no published version contract and may print a build string containing no dotted
# number at all. Routed through Write-Report that would yield an empty version and
# announce a working install as MISS, which is the one wrong answer here.
if ($want_android_cli) {
  if (Test-Have 'android') {
    $androidVer = Get-ToolVersion 'android' @('-V')
    if (-not $androidVer) { $androidVer = 'present' }
    Write-Output "OK android-cli $androidVer"
    # A found binary is still not full capability on Windows: Google disables the
    # emulator subcommand here, so an unqualified OK would overstate what works.
    Write-Output 'NOTE android-emulator disabled-on-windows'
  } else {
    Write-Output 'MISS android-cli -'
  }
}

# --- desktop scenario --------------------------------------------------------

if ($want_rust) {
  Write-Report 'rustup' (Get-ToolVersion 'rustup' @('--version'))
  Write-Report 'rustc' (Get-ToolVersion 'rustc' @('--version')) $REQ_RUST
  Write-Report 'cargo' (Get-ToolVersion 'cargo' @('--version'))

  # Tauri renders through WebView2 on Windows, the counterpart of webkit2gtk on
  # Linux. The runtime has no command on PATH, so the installed version is only
  # visible through its EdgeUpdate client key - per-machine on the WOW6432Node
  # side, per-user for the standalone installer.
  $webview2 = ''
  foreach ($key in @(
      'HKLM:\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}',
      'HKCU:\SOFTWARE\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}'
    )) {
    try {
      $pv = (Get-ItemProperty -Path $key -Name pv -ErrorAction SilentlyContinue).pv
      if ($pv) { $webview2 = $pv; break }
    } catch {
      continue
    }
  }
  if ($webview2) {
    Write-Output "OK webview2 $webview2"
  } else {
    Write-Output 'MISS webview2 -'
  }

  # Rust's MSVC toolchain links with the Visual Studio C++ build tools, which are
  # not on PATH outside a developer prompt. vswhere is the supported way to ask,
  # and it lives at a fixed location installed alongside any VS component.
  $msvc = ''
  $vswhere = Join-Path ${env:ProgramFiles(x86)} 'Microsoft Visual Studio\Installer\vswhere.exe'
  if (Test-Path -LiteralPath $vswhere) {
    try {
      $found = & $vswhere -latest -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationVersion 2>$null
      $msvc = Get-FirstVersion (($found | Out-String))
    } catch {
      $msvc = ''
    }
  }
  if ($msvc) {
    Write-Output "OK msvc $msvc"
  } else {
    Write-Output 'MISS msvc -'
  }
}
