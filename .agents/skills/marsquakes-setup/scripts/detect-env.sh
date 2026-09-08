#!/bin/sh
# Marsquakes environment detection - macOS / Linux / WSL / Git Bash.
#
# Reports only. Installing is the caller's job (see references/install-matrix.md),
# which is why this is not called `doctor`: nothing here repairs anything.
#
# Dependency-free on purpose. This runs *before* Node.js exists, so it cannot be
# a Node script, and it must not assume bash: some minimal Linux images ship
# only dash or busybox ash.
#
# Output contract, one item per line:
#
#   os <darwin|linux|windows|unknown>
#   arch <uname -m>
#   pkg <brew|apt|dnf|yum|pacman|zypper|apk|none>
#   scope <base|base,admin|...>
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
# plain `command -v` check reports as present, and it is the most common reason
# a build fails after "everything is installed".
#
# Usage:
#   detect-env.sh                        # base tools only (default)
#   detect-env.sh --scenario admin       # base + Docker/JDK/Maven
#   detect-env.sh --scenario admin,desktop
#   detect-env.sh --scenario all         # everything this script knows about
#
# The default is deliberately narrow. Reporting `MISS docker` and `MISS java` on
# a machine that will only ever build a desktop app invites installing both, and
# the JDK is the largest install in the matrix. Ask for a scenario only once the
# project actually needs it -- `mars init` derives that from platforms.json.

set -u

# --- scenario selection ------------------------------------------------------

# The base tools are always reported: without Node, pnpm and git nothing works
# at all, regardless of which platforms a project enables.
#
# Everything else is opt-in per *tool group* rather than per scenario, because
# the scenarios do not partition cleanly. Android needs a JDK but drives it with
# Gradle, so probing Maven would report a miss that never matters; the native
# windows/linux/macos platforms are not Tauri, so they need no Rust.
want_docker=0
want_java=0
want_maven=0
want_rust=0
want_android_cli=0

add_scenario() {
  case "$1" in
    base) ;;
    # `admin` and `desktop` are the scenario names used by
    # references/install-matrix.md. `desktop` doubles as the Tauri platform name
    # in platforms.json, which is why one branch serves both.
    admin) want_docker=1; want_java=1; want_maven=1 ;;
    desktop) want_rust=1 ;;
    all) want_docker=1; want_java=1; want_maven=1; want_rust=1; want_android_cli=1 ;;
    # Platform names, so a caller can forward platforms.json entries verbatim
    # instead of maintaining its own platform-to-tool mapping. `mars init` does
    # exactly that.
    api) want_docker=1; want_java=1; want_maven=1 ;;
    # The Android CLI is additive, not a substitute for the JDK: Gradle still
    # runs on the host, so a machine with the CLI but no JDK cannot build.
    android) want_java=1; want_android_cli=1 ;;
    # web / web-admin need only the base tools. ios and the native
    # windows/linux/macos targets build with their own OS toolchain (Xcode, MSVC,
    # gcc), which this script cannot meaningfully version-check.
    web | web-admin | ios | windows | linux | macos) ;;
    *)
      echo "detect-env: unknown scenario '$1'" >&2
      exit 2
      ;;
  esac
}

while [ $# -gt 0 ]; do
  case "$1" in
    --scenario)
      [ $# -ge 2 ] || { echo "detect-env: --scenario needs a value" >&2; exit 2; }
      # Split on commas without invoking a subshell per item.
      IFS=,
      for item in $2; do
        [ -n "$item" ] && add_scenario "$item"
      done
      unset IFS
      shift 2
      ;;
    --help | -h)
      # Stop at the first non-comment line rather than at a hard-coded line
      # number: the previous `sed -n '2,26p'` silently truncated the help text
      # the moment the header grew. awk is already a dependency (see vercmp),
      # and this mirrors what detect-env.ps1 does with its own header.
      awk 'NR > 1 { if ($0 !~ /^#/) exit; sub(/^# ?/, ""); print }' "$0"
      exit 0
      ;;
    *)
      echo "detect-env: unknown argument '$1'" >&2
      exit 2
      ;;
  esac
done

# Keep these in sync with the floors documented in references/install-matrix.md.
# The Node floor is a full version, not a major: Vite 7 refuses anything below
# 22.12.0 on the 22 line, so comparing majors only would wave 22.0-22.11 through
# and the failure would surface much later, inside Vite.
REQ_NODE=22.12.0
REQ_PNPM=9.0.0
REQ_GIT=2.20.0
REQ_JAVA=17
REQ_MAVEN=3.9.0
REQ_DOCKER=20.10.0
REQ_COMPOSE=2.0.0
REQ_RUST=1.77.0

have() { command -v "$1" >/dev/null 2>&1; }

# First dotted number in the input, e.g. `Apache Maven 3.9.6 (abc)` -> `3.9.6`.
extract() { grep -o '[0-9][0-9]*\(\.[0-9][0-9]*\)*' 2>/dev/null | head -n 1; }

# Prints `older` when $1 < $2, otherwise `ok`. Compares component by component
# so that 1.10.0 sorts above 1.9.0, which a string comparison gets wrong.
# Trailing build metadata is tolerated because awk parses a leading number:
# `9+7` reads as 9.
vercmp() {
  awk -v a="$1" -v b="$2" 'BEGIN {
    na = split(a, x, "."); nb = split(b, y, ".");
    n = (na > nb ? na : nb);
    for (i = 1; i <= n; i++) {
      ai = (i <= na ? x[i] + 0 : 0);
      bi = (i <= nb ? y[i] + 0 : 0);
      if (ai < bi) { print "older"; exit }
      if (ai > bi) { print "ok"; exit }
    }
    print "ok"
  }'
}

report() { # <tool> <version-or-empty> <floor-or-empty>
  _tool=$1; _ver=$2; _req=$3
  if [ -z "$_ver" ]; then
    echo "MISS $_tool -"
  elif [ -n "$_req" ] && [ "$(vercmp "$_ver" "$_req")" = older ]; then
    echo "OLD $_tool $_ver (need >=$_req)"
  else
    echo "OK $_tool $_ver"
  fi
}

# --- context -----------------------------------------------------------------

uname_s=$(uname -s 2>/dev/null || echo unknown)
case "$uname_s" in
  Darwin) os=darwin ;;
  Linux) os=linux ;;
  MINGW* | MSYS* | CYGWIN*) os=windows ;;
  *) os=unknown ;;
esac

echo "os $os"
echo "arch $(uname -m 2>/dev/null || echo unknown)"

pkg=none
if [ "$os" = darwin ]; then
  have brew && pkg=brew
else
  for candidate in apt-get dnf yum pacman zypper apk; do
    if have "$candidate"; then
      case "$candidate" in
        apt-get) pkg=apt ;;
        *) pkg=$candidate ;;
      esac
      break
    fi
  done
fi
echo "pkg $pkg"

# Tells the caller which groups this run actually looked at, so an absent tool
# can be distinguished from an unasked-for one. A missing group is not a finding.
scope=base
[ "$want_docker" = 1 ] && scope="$scope,docker"
[ "$want_java" = 1 ] && scope="$scope,java"
[ "$want_maven" = 1 ] && scope="$scope,maven"
[ "$want_rust" = 1 ] && scope="$scope,rust"
[ "$want_android_cli" = 1 ] && scope="$scope,android-cli"
echo "scope $scope"

# --- always required ---------------------------------------------------------

# mise installs Node, the JDK, Maven and Rust here, so `MISS mise` is usually the
# single cause behind several of the misses below rather than a separate finding.
# No floor: any mise can install a pinned toolchain.
report mise "$(mise --version 2>/dev/null | extract)" ""

report node "$(node -v 2>/dev/null | sed 's/^v//')" "$REQ_NODE"
report pnpm "$(pnpm --version 2>/dev/null | extract)" "$REQ_PNPM"
report git "$(git --version 2>/dev/null | extract)" "$REQ_GIT"
report mars "$(mars --version 2>/dev/null | extract)" ""

# Corepack ships with Node and is how pnpm is meant to be enabled here, so its
# absence explains a missing pnpm rather than being a separate problem.
report corepack "$(corepack --version 2>/dev/null | extract)" ""

# --- admin scenario ----------------------------------------------------------

if [ "$want_docker" = 1 ]; then
  report docker "$(docker --version 2>/dev/null | extract)" "$REQ_DOCKER"
  report docker-compose "$(docker compose version 2>/dev/null | extract)" "$REQ_COMPOSE"

  # An installed Docker whose daemon is not running looks identical to a working
  # one until the first build, so check reachability separately.
  if have docker; then
    if docker info >/dev/null 2>&1; then
      echo "OK docker-daemon reachable"
    else
      echo "MISS docker-daemon -"
    fi
  fi
fi

if [ "$want_java" = 1 ]; then
  # Guarded by `have` because this is the only probe that keeps stderr: the JDK
  # prints its version there, so `2>/dev/null` would blank out a working install.
  # The cost is that an *absent* java lets the shell's own
  # `detect-env.sh: line 233: java: command not found` reach `extract`, which
  # returns the first number it sees -- the line number. A host with no JDK was
  # reporting `OK java 233`, and the number moved whenever the file was edited.
  if have java; then
    report java "$(java -version 2>&1 | head -n 1 | extract)" "$REQ_JAVA"
  else
    echo "MISS java -"
  fi
fi

if [ "$want_maven" = 1 ]; then
  report maven "$(mvn -v 2>/dev/null | head -n 1 | extract)" "$REQ_MAVEN"
fi

# --- android scenario --------------------------------------------------------

# Google's agent-first `android` CLI, not the SDK's sdkmanager/avdmanager. It is
# a single user-scoped binary in ~/.local/bin, installed by `mars init` from
# Google's own installer -- see references/install-matrix.md.
#
# Reported by presence rather than through `report`, because `android -V` has no
# published version contract and may print a build string containing no dotted
# number at all. Routed through `report` that would extract an empty version and
# announce a working install as MISS, which is the one wrong answer here.
if [ "$want_android_cli" = 1 ]; then
  if have android; then
    _android_ver=$(android -V 2>&1 | head -n 1 | extract)
    echo "OK android-cli ${_android_ver:-present}"
    # Git Bash / MSYS still runs on Windows, where Google disables the emulator
    # subcommand, so the caveat is keyed on the detected OS rather than on which
    # of the two scripts happens to be running.
    [ "$os" = windows ] && echo "NOTE android-emulator disabled-on-windows"
  else
    echo "MISS android-cli -"
  fi
fi

# --- desktop scenario --------------------------------------------------------

if [ "$want_rust" = 1 ]; then
  report rustup "$(rustup --version 2>/dev/null | extract)" ""
  report rustc "$(rustc --version 2>/dev/null | extract)" "$REQ_RUST"
  report cargo "$(cargo --version 2>/dev/null | extract)" ""

  # Tauri links against system libraries on Linux. On macOS the equivalent is the
  # Xcode command line tools, which own `xcode-select`.
  if [ "$os" = linux ]; then
    if have pkg-config; then
      if pkg-config --exists webkit2gtk-4.1 2>/dev/null || pkg-config --exists webkit2gtk-4.0 2>/dev/null; then
        echo "OK tauri-deps webkit2gtk"
      else
        echo "MISS tauri-deps -"
      fi
    else
      echo "MISS pkg-config -"
    fi
  elif [ "$os" = darwin ]; then
    if xcode-select -p >/dev/null 2>&1; then
      echo "OK xcode-clt installed"
    else
      echo "MISS xcode-clt -"
    fi
  fi
fi
