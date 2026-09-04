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
#   OK   <tool> <version>
#   OLD  <tool> <version> (need >=<floor>)
#   MISS <tool> -
#
# Parse this instead of probing tools one at a time: OLD is the case that a
# plain `command -v` check reports as present, and it is the most common reason
# a build fails after "everything is installed".

set -u

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

report java "$(java -version 2>&1 | head -n 1 | extract)" "$REQ_JAVA"
report maven "$(mvn -v 2>/dev/null | head -n 1 | extract)" "$REQ_MAVEN"

# --- desktop scenario --------------------------------------------------------

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
