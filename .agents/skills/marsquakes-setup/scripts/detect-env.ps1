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
#   OK   <tool> <version>
#   OLD  <tool> <version> (need >=<floor>)
#   MISS <tool> -
#
# Parse this instead of probing tools one at a time: OLD is the case that a
# plain `Get-Command` check reports as present, and it is the most common reason
# a build fails after "everything is installed".

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

Write-Report 'java' (Get-ToolVersion 'java' @('-version')) $REQ_JAVA
Write-Report 'maven' (Get-ToolVersion 'mvn' @('-v')) $REQ_MAVEN

# --- desktop scenario --------------------------------------------------------

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
