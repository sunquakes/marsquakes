# Marsquakes - AGENTS.md

## Project Overview

- **Project Name**: Marsquakes
- **Multi-platform Project**: Android / iOS / Web / API / Windows / Linux / macOS / Desktop
- **Monorepo Tools**: pnpm workspace + Turborepo
- **Platform Configuration**: `platforms.json` (defines enabled platforms and tech stacks, AI automatically generates directories based on this)

## Directory Rules (Globally Applied)

### Work Mode
- All documents, tasks, and PRDs **MUST** be generated in `./docs/` or `./docs/task/` directories
- **API interface documents** **MUST** be generated in `./docs/api/` directory
- Prohibit placing document files directly in the project root directory or other locations

### Design Mode
- All design drafts, images, pages, and cutouts **MUST** be generated in `./design/` and its subdirectories
- Prohibit placing design files directly in the project root directory or other locations

### Platform Code Directories
- **Mobile**: `./apps/android/`, `./apps/ios/`
- **Desktop**: `./apps/windows/`, `./apps/linux/`, `./apps/macos/`, `./apps/desktop/`
- **Web Client**: `./apps/web/`
- **Web Admin**: `./apps/web-admin/`
- **Backend API**: `./apps/api/`

### General Prohibitions
- **Prohibit** generating design files or document files directly in the project root directory
- Temporary files, scripts, and other intermediate products should be placed in the system temporary directory, not polluting the project directory

## Project Structure Convention

```
Marsquakes/
├── apps/                    # All platform applications
│   ├── android/             # Android (Gradle, see apps/android/AGENTS.md)
│   ├── ios/                 # iOS (Xcode, see apps/ios/AGENTS.md)
│   ├── windows/             # Windows Desktop (see apps/windows/AGENTS.md)
│   ├── linux/               # Linux Desktop (see apps/linux/AGENTS.md)
│   ├── macos/               # macOS Desktop (see apps/macos/AGENTS.md)
│   ├── desktop/             # Desktop (Tauri, see apps/desktop/AGENTS.md)
│   ├── web/                 # Web Client (pnpm workspace member, see apps/web/AGENTS.md)
│   ├── web-admin/           # Web Admin (pnpm workspace member, see apps/web-admin/AGENTS.md)
│   └── api/                 # Backend API (see apps/api/AGENTS.md)
├── packages/                # Shared packages (pnpm workspace members)
│   ├── tsconfig/            # Shared tsconfig
│   ├── eslint-config/       # Shared ESLint configuration
│   └── mars-cli/            # CLI scaffolding tool (command: mars)
├── docs/                    # Documents, tasks, PRDs
│   ├── task/                # Task documents
│   └── api/                 # API interface documents
├── design/                  # Design drafts, images, cutouts
├── scripts/                 # Initialization and tool scripts
│   └── init.js              # One-click initialization script
├── package.json             # Top-level command entry
├── pnpm-workspace.yaml      # pnpm workspace configuration
├── turbo.json               # Turborepo pipeline configuration
├── platforms.json           # Platform configuration (enabled/disabled platforms and tech stacks)
├── AGENTS.md                # This file (global rules)
└── .gitignore
```

## CLI Scaffolding

This project provides the `mars` CLI tool, which can be installed globally to quickly create new projects.

### Installation

```bash
npm install -g @marsquakes/cli
```

### Create Project

```bash
mars create my-project
mars create my-project --template <git-url>
mars create my-project --from <local-path>
```

### Development & Build

Run in the project directory (automatically reads `platforms.json` to determine enabled platforms):

```bash
mars dev                           # Start all enabled platforms
mars dev --platform web            # Start Web only
mars dev --platform android        # Start Android only
mars dev --platform web --docker   # Start Web in Docker (automatically builds image first)
mars build --platform web          # Build Web only
mars build --platform android      # Build Android only
mars build --platform web --docker # Build Web in Docker
mars init                          # Initialize dependencies + check environment
mars clean                         # Clean build artifacts
```

### Docker Support

The `--docker` flag automatically:
1. Checks if Docker is installed
2. Selects `docker/<platform>/Dockerfile` (dev) or `Dockerfile.build` (build) based on platform and command
3. Builds image: `docker build -t marsquakes/<platform>:<mode>`
4. Runs container: `docker run`

Currently supported platforms:
| Platform | dev Dockerfile | build Dockerfile |
|----------|---------------|------------------|
| web | `docker/web/Dockerfile` | `docker/web/Dockerfile.build` |

CLI automatically:
1. Copies/clones template to target directory
2. Replaces project name (`package.json`, `AGENTS.md`, `platforms.json`, etc.)
3. Initializes Git repository and commits

### Local Development Testing

Run directly within the monorepo:

```bash
node packages/mars-cli/bin/mars.js create my-project --from .
```

## Monorepo Description

This project uses **pnpm workspace + Turborepo** to manage dependencies and builds within the npm ecosystem.

### pnpm workspace

- All npm packages are managed uniformly by pnpm, root directory `pnpm install` installs all dependencies at once
- `pnpm-workspace.yaml` defines workspace members: `apps/web`, `packages/*`
- When adding new npm sub-projects, place them in `packages/` directory or declare in `pnpm-workspace.yaml`

### Turborepo

- Defines build pipelines (build / dev / lint / clean) through `turbo.json`
- Supports task caching and parallel execution to improve build efficiency
- Only applies to packages within the npm workspace, native platforms like Android/iOS still use their respective toolchains

### Common Commands

```bash
# Initialize (install all dependencies + check environment)
pnpm install
npm run init

# Development (Turborepo parallel start)
pnpm dev              # Start all dev tasks
pnpm dev --filter=web # Start Web only

# Build (Turborepo with caching)
pnpm build              # Build all
pnpm build --filter=web # Build Web only

# Clean
turbo clean           # Clean all workspace build artifacts

# Android/iOS native commands (not managed by Turborepo)
npm run dev:android   # cd apps/android && gradlew installDebug
npm run build:android # cd apps/android && gradlew assembleRelease
```

## Platform Configuration Description

The project defines enabled platforms through `platforms.json`. When AI initializes or adds platforms, it should read this configuration and automatically generate corresponding directories and AGENTS.md.

```jsonc
// platforms.json structure example
{
  "platforms": {
    "mobile": { "android": { "enabled": true, "dir": "apps/android" }, ... },
    "desktop": { "windows": { "enabled": true, "dir": "apps/windows" }, ... },
    "web": { "web": { "enabled": true, "dir": "apps/web" } },
    "api": { "api": { "enabled": true, "dir": "apps/api" } }
  }
}
```

When adding a new platform: Update `platforms.json` → Create corresponding directory under `apps/` → Create AGENTS.md → Update the platform table in this file.

## Platform-specific AGENTS.md

Each platform directory has its own `AGENTS.md`, containing coding standards, build commands, notes, etc. When AI processes specific platform code, it should refer to the AGENTS.md in the corresponding directory:

| Platform | AGENTS.md Path |
|----------|----------------|
| Android | [apps/android/AGENTS.md](apps/android/AGENTS.md) |
| iOS | [apps/ios/AGENTS.md](apps/ios/AGENTS.md) |
| Windows | [apps/windows/AGENTS.md](apps/windows/AGENTS.md) |
| Linux | [apps/linux/AGENTS.md](apps/linux/AGENTS.md) |
| macOS | [apps/macos/AGENTS.md](apps/macos/AGENTS.md) |
| Desktop | [apps/desktop/AGENTS.md](apps/desktop/AGENTS.md) |
| Web | [apps/web/AGENTS.md](apps/web/AGENTS.md) |
| Web Admin | [apps/web-admin/AGENTS.md](apps/web-admin/AGENTS.md) |
| API | [apps/api/AGENTS.md](apps/api/AGENTS.md) |

## Global Coding Standards

- **Commit Messages**: **MUST** be in English. Use concise descriptions following conventional commits format:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation
  - `style:` for code style changes
  - `refactor:` for code refactoring
  - `test:` for tests
  - `chore:` for build/tooling changes
- **Git Branches**: Main branch is `main`, feature branches named `feature/xxx`, fix branches `fix/xxx`
- **Ignored Files**: `.idea/`, `.gradle/`, `local.properties`, build artifacts, `node_modules`, `.turbo/`, etc. are already added to `.gitignore`