## [0.1.0] - 2026-09-30

First public release of the `mars` command.

### Added

- Add `mars create <project-name>` to scaffold a multi-platform monorepo from the bundled template, with interactive platform selection or `-n, --non-interactive` defaults, and `--template <url>` / `--from <path>` for custom templates.
- Add `mars update` to re-sync a generated project from the template while preserving `apps`, `docs` and `.docs`.
- Add `mars init` that reads `platforms.json` and installs only the toolchains the enabled platforms need, checking each one against its minimum version: JDK and Maven for the API, JDK and Android CLI + SDK for Android, Rust for desktop. Re-running it after enabling a platform is idempotent.
- Add a MySQL/Redis setup wizard to `mars init`, with `--registry <default|cn|auto>` selecting mirrors for tool installation while project dependencies are never redirected.
- Add `mars init --docker` to declare that the API runs in a container, so the host JDK and Maven are skipped unless another enabled platform needs them.
- Add Android variant selection during `init`: the variant is derived from the platform set with no prompt — the `api` variant when an API platform is enabled, otherwise the standalone `local` variant — with `--android-mode local|api` overriding the derived value. Switching is idempotent and toggles only the `:core:network` include, its app dependency and the Hilt binding that owns `AuthRepository`.
- Add `mars dev` and `mars build` to start or build all enabled platforms, or a single one with `--platform <platform>`, including full-stack startup of the Java API; `--docker` builds and runs inside a container.
- Add `mars module add|remove feature:<name>|core:<name>` to scaffold and unregister Android Gradle modules without hand-editing Gradle files, with `--hilt`, `--compose` and `--mount` options.
- Add `mars region` to report whether the host should use the `cn` or default mirrors, with the detection reason.
- Add `mars clean` to remove build artifacts across enabled platforms.
- Add bilingual output (English and Chinese) with `--lang <en|zh>` or automatic detection.
- Add an npm release workflow that publishes on version tags via trusted publishing (OIDC), uses the matching CHANGELOG section as the GitHub Release notes and creates the GitHub Release.
