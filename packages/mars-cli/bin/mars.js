#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const path = require('path');
const readline = require('readline');
const { execSync, spawn } = require('child_process');

const pkg = require(path.join(__dirname, '..', 'package.json'));

const DEFAULT_TEMPLATE = 'https://github.com/sunquakes/marsquakes.git';

const LOCALES = {
  en: {
    'web-label': 'Web Client',
    'web-desc': 'User-facing web frontend application',
    'web-admin-label': 'Web Admin',
    'web-admin-desc': 'Backend administration system',
    'api-label': 'API Service',
    'api-desc': 'RESTful API service',
    'android-label': 'Android',
    'android-desc': 'Android native application',
    'ios-label': 'iOS',
    'ios-desc': 'iOS native application',
    'windows-label': 'Windows',
    'windows-desc': 'Windows desktop application',
    'linux-label': 'Linux',
    'linux-desc': 'Linux desktop application',
    'macos-label': 'macOS',
    'macos-desc': 'macOS desktop application',
    'desktop-label': 'Desktop',
    'desktop-desc': 'Tauri (Win / macOS / Linux)',
    'category-web': '🌐 Web',
    'category-api': '⚙️ API',
    'category-mobile': '📱 Mobile',
    'category-desktop': '🖥️ Desktop',
    'status-developing': 'developing',
    'host-requires': 'requires {{hosts}}',
    'host-current': 'Current host: {{host}}',
    'host-hint': '⚠️ Modules that cannot be built on this host are not selectable',
    'host-skipped': '⚠️ Skipped (cannot be built on {{host}}): {{list}}',
    'host-blocked': '❌ Platform "{{platform}}" can only be built on {{hosts}} (current host: {{host}})',
    'host-none-selected': '❌ No platform is selectable on {{host}}.',
    'select-platforms': '📋 Select platforms to create',
    'select-hint': 'Use arrow keys to navigate | Space to toggle | Enter to confirm',
    'disabled-hint': '⚠️ Grayed out modules are not available (developing)',
    'select-toolchain-hint': '🧰 Ticking a platform also opts into its toolchain: `mars init` checks it and installs what is missing. Tick nothing extra and nothing extra is downloaded.',
    'platform-toolchain': '↳ toolchain: {{list}}',
    'selection-toolchain': '🧰 `mars init` will check/install: {{list}}',
    'selection-toolchain-none': '🧰 This selection needs no extra toolchain',
    'current-selection': 'Currently selected: {{count}} modules',
    'cancelled': '🛑 Project creation cancelled.',
    'cancelled-cleanup': '🛑 Cancelled project creation, cleaning up...',
    'enter-selection': 'Please enter selection (space-separated numbers): ',
    'input-hint': 'Input tips:',
    'input-select': '- Enter numbers to toggle selection (e.g., 1 2 3)',
    'input-select-all': '- Enter "a" to select all available modules',
    'input-deselect-all': '- Enter "n" to deselect all',
    'input-default': '- Press Enter to use default configuration',
    'selected-modules': '✅ Selected {{count}} modules:',
    'copy-platform': '📁 Copying platform: {{name}}',
    'enter-interactive': '🔧 Entering interactive platform selection mode...',
    'using-default': '🔧 Using default module configuration...',
    'selected-count': 'Selected {{count}} modules: {{list}}',
    'skip-interactive': 'Use -n / --non-interactive flag to skip interactive mode',
    'creating-directory': '🔧 Creating project directory...',
    'copying-base': '🔧 Copying base files...',
    'copying-platforms': '🔧 Copying selected platforms...',
    'updating-config': '🔧 Updating platform configuration...',
    'customizing-name': '🔧 Customizing project name...',
    'initializing-git': '🔨 Initializing git repository...',
    'project-created': '✅ Project "{{name}}" created successfully!',
    'next-steps': 'Next steps:',
    'project-name': 'Project Name',
    'multi-platform-project': 'Multi-platform Project',
    'template-not-found': '❌ Error: Template directory "{{path}}" does not exist.',
    'failed-clone': '❌ Failed to clone template. Please check the URL or your network connection.',
    'directory-exists': '❌ Error: Directory "{{name}}" already exists.',
    'not-project': '❌ Error: Not in a Marsquakes project.',
    'pnpm-not-installed': '❌ pnpm is not installed. Enable it with: corepack enable pnpm',
    'initializing-dependencies': '🔧 Initializing project dependencies...',
    'initializing': '🔧 Initializing...',
    'installing-dependencies': '📦 Installing dependencies...',
    'starting-dev': '🚀 Starting development servers...',
    'stopping-dev': '🛑 Stopping all development servers...',
    'building': '🏗️ Building...',
    'platform-not-found': '❌ Error: Platform "{{platform}}" not found or not enabled.',
    'platform-pending': '⏳ {{name}}: {{desc}} (pending)',
    'platform-not-ready': '⏳ {{name}}: {{desc}} (directory not ready)',
    'platform-not-supported': '⏳ {{name}}: {{desc}} (not supported yet)',
    'toolchain-none': '🧰 No extra toolchain needed for the enabled platforms.',
    'toolchain-registry': '🌐 Registry profile: {{profile}} (tool installs only)',
    'toolchain-scope': '🧰 Toolchain required by this project: {{list}}',
    'toolchain-derived': '   (derived from: {{list}})',
    'toolchain-ok': '✅ {{label}} {{version}}',
    'toolchain-old': '⚠️ {{label}} {{version}} is older than {{floor}}',
    'toolchain-miss': '❌ {{label}} not found',
    'toolchain-api-docker': 'ℹ️ --docker given, so the API runs in a container. Skipping {{list}}, which nothing else on this host needs.',
    'toolchain-ready': '✅ Toolchain is ready. Nothing to install.',
    'toolchain-manual': 'ℹ️ {{label}} must be installed by hand — see .agents/skills/marsquakes-setup/references/install-matrix.md',
    'toolchain-mise-missing': '⚠️ mise is not installed, so {{list}} cannot be installed automatically. See .agents/skills/marsquakes-setup/references/install-matrix.md',
    'toolchain-installing': '📥 Installing {{label}} via mise ({{pin}})...',
    'toolchain-installing-official': '📥 Installing {{label}} with its official installer (user-scoped, no admin rights)...',
    'toolchain-install-failed': '❌ Failed to install {{label}}. Install it by hand — see .agents/skills/marsquakes-setup/references/install-matrix.md',
    'toolchain-installed': '✅ Toolchain installed. Open a new shell so it lands on PATH.',
    'registry-unknown': 'Unknown registry profile "{{profile}}". Use one of: default, cn',
    'android-cli-unsupported': 'ℹ️ Google publishes no Android CLI binary for {{host}}. Skipping — see .agents/skills/marsquakes-setup/references/install-matrix.md',
    'android-cli-download-failed': '❌ Could not download the Android CLI installer from {{url}}',
    'android-cli-windows-emulator': 'ℹ️ Note: `android emulator` is disabled on Windows by Google. Use Android Studio\'s Device Manager for emulators.',
    'android-sdk-installing': '📥 Installing Android SDK packages: {{list}}...',
    'android-sdk-install-failed': '❌ Failed to install the SDK packages. Run `android sdk install` by hand — see .agents/skills/marsquakes-setup/references/install-matrix.md',
    'android-sdk-ready': '✅ Android SDK is at {{dir}}',
    'android-sdk-local-properties': '✅ Wrote sdk.dir into {{file}}',
    'android-sdk-cli-missing': 'ℹ️ Android CLI is not available yet, so the SDK packages were skipped. Run `mars init` again once it is installed.',
    'android-sdk-no-compilesdk': 'ℹ️ No compileSdk found in {{file}}, so no SDK package could be derived. Skipping.',
  },
  zh: {
    'web-label': 'Web 用户端',
    'web-desc': '面向用户的 Web 前端应用',
    'web-admin-label': 'Web 后台管理',
    'web-admin-desc': '后台管理系统',
    'api-label': '后端接口服务',
    'api-desc': 'RESTful API 服务',
    'android-label': 'Android 客户端',
    'android-desc': 'Android 原生应用',
    'ios-label': 'iOS 客户端',
    'ios-desc': 'iOS 原生应用',
    'windows-label': 'Windows 桌面端',
    'windows-desc': 'Windows 桌面应用',
    'linux-label': 'Linux 桌面端',
    'linux-desc': 'Linux 桌面应用',
    'macos-label': 'macOS 桌面端',
    'macos-desc': 'macOS 桌面应用',
    'desktop-label': 'Desktop',
    'desktop-desc': 'Tauri (Win / macOS / Linux)',
    'category-web': '🌐 Web',
    'category-api': '⚙️ API',
    'category-mobile': '📱 移动端',
    'category-desktop': '🖥️ 桌面端',
    'status-developing': '开发中',
    'host-requires': '需要 {{hosts}}',
    'host-current': '当前宿主机: {{host}}',
    'host-hint': '⚠️ 当前系统无法构建的模块不可选',
    'host-skipped': '⚠️ 已跳过（在 {{host}} 上无法构建）: {{list}}',
    'host-blocked': '❌ 平台 "{{platform}}" 只能在 {{hosts}} 上构建（当前宿主机: {{host}}）',
    'host-none-selected': '❌ 在 {{host}} 上没有可选的平台。',
    'select-platforms': '📋 请选择需要创建的平台模块',
    'select-hint': '操作提示: 上下键移动 | 空格键切换选择 | 回车确认',
    'disabled-hint': '⚠️ 灰色显示的模块当前不可选（开发中）',
    'select-toolchain-hint': '🧰 勾选一个平台就等于勾选了它的工具链：mars init 会校验并安装缺失的部分。不多勾，就不会多下载。',
    'platform-toolchain': '↳ 工具链: {{list}}',
    'selection-toolchain': '🧰 mars init 将校验/安装: {{list}}',
    'selection-toolchain-none': '🧰 当前选择不需要额外工具链',
    'current-selection': '当前已选择 {{count}} 个模块',
    'cancelled': '🛑 已取消创建项目。',
    'cancelled-cleanup': '🛑 已取消创建项目，正在清理...',
    'enter-selection': '请输入选择（多个数字用空格分隔）: ',
    'input-hint': '操作提示:',
    'input-select': '- 输入数字切换选中状态（如：1 2 3）',
    'input-select-all': '- 输入 a 全选可选模块',
    'input-deselect-all': '- 输入 n 取消全选',
    'input-default': '- 直接回车使用默认配置',
    'selected-modules': '✅ 已选择 {{count}} 个模块:',
    'copy-platform': '📁 拷贝平台: {{name}}',
    'enter-interactive': '🔧 进入交互式平台选择模式...',
    'using-default': '🔧 使用默认模块配置...',
    'selected-count': '已选择 {{count}} 个模块: {{list}}',
    'skip-interactive': '使用 -n / --non-interactive 参数跳过交互模式',
    'creating-directory': '🔧 创建项目目录...',
    'copying-base': '🔧 拷贝项目基础文件...',
    'copying-platforms': '🔧 拷贝选中的平台模块...',
    'updating-config': '🔧 更新平台配置...',
    'customizing-name': '🔧 自定义项目名称...',
    'initializing-git': '🔨 初始化 git 仓库...',
    'project-created': '✅ 项目 "{{name}}" 创建成功！',
    'next-steps': '下一步操作:',
    'project-name': '项目名称',
    'multi-platform-project': '多平台项目',
    'template-not-found': '❌ 错误: 模板目录 "{{path}}" 不存在。',
    'failed-clone': '❌ 克隆模板失败，请检查 URL 或网络连接。',
    'directory-exists': '❌ 错误: 目录 "{{name}}" 已存在。',
    'not-project': '❌ 错误: 不在 Marsquakes 项目中。',
    'pnpm-not-installed': '❌ pnpm 未安装，请先启用: corepack enable pnpm',
    'initializing-dependencies': '🔧 初始化项目依赖...',
    'initializing': '🔧 初始化中...',
    'installing-dependencies': '📦 安装依赖中...',
    'starting-dev': '🚀 启动开发服务器...',
    'stopping-dev': '🛑 停止所有开发服务器...',
    'building': '🏗️ 构建中...',
    'platform-not-found': '❌ 错误: 平台 "{{platform}}" 不存在或未启用。',
    'platform-pending': '⏳ {{name}}: {{desc}} (待初始化)',
    'platform-not-ready': '⏳ {{name}}: {{desc}} (目录未就绪)',
    'platform-not-supported': '⏳ {{name}}: {{desc}} (待支持)',
    'toolchain-none': '🧰 已启用的平台不需要额外工具链。',
    'toolchain-registry': '🌐 镜像配置: {{profile}}（仅用于安装工具）',
    'toolchain-scope': '🧰 本项目需要的工具链: {{list}}',
    'toolchain-derived': '   （来自: {{list}}）',
    'toolchain-ok': '✅ {{label}} {{version}}',
    'toolchain-old': '⚠️ {{label}} {{version}} 低于要求的 {{floor}}',
    'toolchain-miss': '❌ 未检测到 {{label}}',
    'toolchain-api-docker': 'ℹ️ 已指定 --docker，API 跑在容器里，已跳过 {{list}}（本机其他平台也不需要）。',
    'toolchain-ready': '✅ 工具链已就绪，无需安装。',
    'toolchain-manual': 'ℹ️ {{label}} 需要手动安装，参见 .agents/skills/marsquakes-setup/references/install-matrix.md',
    'toolchain-mise-missing': '⚠️ 未安装 mise，无法自动安装 {{list}}。请参见 .agents/skills/marsquakes-setup/references/install-matrix.md',
    'toolchain-installing': '📥 正在通过 mise 安装 {{label}} ({{pin}})...',
    'toolchain-installing-official': '📥 正在用官方安装器安装 {{label}}（用户级，无需管理员权限）...',
    'toolchain-install-failed': '❌ {{label}} 安装失败，请手动安装，参见 .agents/skills/marsquakes-setup/references/install-matrix.md',
    'toolchain-installed': '✅ 工具链安装完成。请打开一个新终端，让它进入 PATH。',
    'registry-unknown': '未知的镜像配置“{{profile}}”。可选值为: default、cn',
    'android-cli-unsupported': 'ℹ️ Google 未为 {{host}} 提供 Android CLI 二进制，已跳过。参见 .agents/skills/marsquakes-setup/references/install-matrix.md',
    'android-cli-download-failed': '❌ 无法从 {{url}} 下载 Android CLI 安装脚本',
    'android-cli-windows-emulator': 'ℹ️ 注意：Google 已在 Windows 上停用 `android emulator`，模拟器请用 Android Studio 的 Device Manager。',
    'android-sdk-installing': '📥 正在安装 Android SDK 包: {{list}}...',
    'android-sdk-install-failed': '❌ SDK 包安装失败，请手动执行 `android sdk install`，参见 .agents/skills/marsquakes-setup/references/install-matrix.md',
    'android-sdk-ready': '✅ Android SDK 位于 {{dir}}',
    'android-sdk-local-properties': '✅ 已把 sdk.dir 写入 {{file}}',
    'android-sdk-cli-missing': 'ℹ️ 尚无可用的 Android CLI，已跳过 SDK 包安装。装好后再执行一次 `mars init` 即可。',
    'android-sdk-no-compilesdk': 'ℹ️ 未能从 {{file}} 中读到 compileSdk，无法推导要安装的 SDK 包，已跳过。',
  },
};

let CURRENT_LANG = 'en';

function t(key, params = {}) {
  const locales = LOCALES[CURRENT_LANG] || LOCALES.en;
  let text = locales[key] || key;
  for (const [name, value] of Object.entries(params)) {
    text = text.replace(`{{${name}}}`, value);
  }
  return text;
}

// Unlike t(), this returns undefined instead of echoing the key back, so
// callers can fall back to their own default when a translation is missing.
function tOptional(key) {
  const locales = LOCALES[CURRENT_LANG] || LOCALES.en;
  return locales[key] || LOCALES.en[key];
}

function parseLangArg(args) {
  const langIndex = args.indexOf('--lang');
  if (langIndex > -1 && args[langIndex + 1]) {
    const lang = args[langIndex + 1].toLowerCase();
    if (LOCALES[lang]) {
      CURRENT_LANG = lang;
    }
  }
}

const DEFAULT_PLATFORMS = [
  { name: 'web', category: 'web', label: 'Web Client', default: false, description: 'User-facing web frontend application' },
  { name: 'web-admin', category: 'web', label: 'Web Admin', default: true, description: 'Backend administration system' },
  { name: 'api', category: 'api', label: 'API Service', default: true, description: 'RESTful API service' },
  { name: 'android', category: 'mobile', label: 'Android', default: false, description: 'Android native application' },
  { name: 'ios', category: 'mobile', label: 'iOS', default: false, description: 'iOS native application', hosts: ['darwin'] },
  { name: 'windows', category: 'desktop', label: 'Windows', default: false, description: 'Windows desktop application', hosts: ['win32'] },
  { name: 'linux', category: 'desktop', label: 'Linux', default: false, description: 'Linux desktop application', hosts: ['linux'] },
  { name: 'macos', category: 'desktop', label: 'macOS', default: false, description: 'macOS desktop application', hosts: ['darwin'] },
  { name: 'desktop', category: 'desktop', label: 'Desktop', default: false, description: 'Tauri (Win / macOS / Linux)' },
];

const HOST_LABELS = {
  darwin: 'macOS',
  win32: 'Windows',
  linux: 'Linux',
};

function getCurrentHost() {
  return process.platform;
}

function isHostSupported(hosts) {
  if (!hosts || hosts.length === 0) return true;
  return hosts.includes(getCurrentHost());
}

function hostLabel(hosts) {
  if (!hosts || hosts.length === 0) return '';
  return hosts.map(h => HOST_LABELS[h] || h).join(' / ');
}

function getPlatformsFromConfig(config) {
  if (!config || !config.platforms) {
    return DEFAULT_PLATFORMS.map(p => ({
      ...p,
      enabled: true,
      status: null,
      hostSupported: isHostSupported(p.hosts),
    }));
  }

  const platforms = [];
  for (const [category, group] of Object.entries(config.platforms)) {
    for (const [name, info] of Object.entries(group)) {
      const defaultPlatform = DEFAULT_PLATFORMS.find(p => p.name === name);
      const labelKey = `${name}-label`;
      const descKey = `${name}-desc`;
      // platforms.json wins over the built-in table, so a fork can widen or
      // narrow the host requirement without editing the CLI.
      const hosts = info.hosts || defaultPlatform?.hosts || null;
      platforms.push({
        name,
        category,
        label: tOptional(labelKey) || defaultPlatform?.label || name,
        default: info.default === undefined ? !!info.enabled : !!info.default,
        description: tOptional(descKey) || info.description || defaultPlatform?.description || '',
        enabled: !!info.enabled,
        status: info.status || null,
        hosts,
        hostSupported: isHostSupported(hosts),
      });
    }
  }
  return platforms;
}

function showUsage() {
  console.log(`
Usage: mars <command> [options]

Commands:
  create <project-name>    Create a new project from template
  update                   Update project from template (preserves apps, docs, .docs)
  dev                      Start development server (default: all enabled platforms)
  build                    Build project (default: all enabled platforms)
  init                     Initialize project dependencies and check environment
  clean                    Clean all build artifacts

Platforms:
  web, web-admin, android, ios, api, windows, linux, macos, all

Options:
  --template <url>         (create) Use a custom git repository as template
  --from <path>            (create) Use a local directory as template
  -n, --non-interactive    (create) Non-interactive mode (use default platforms)
  --platform <platform>    (dev/build) Run only for specific platform
  --docker                 (dev/build) Run in Docker container
                           (init) The API runs in a container, so skip the host JDK/Maven
  --registry <default|cn>  (init) Mirror used while installing tools only
                           (cn = mainland-China mirrors for npm/Maven/rustup/Node;
                           project dependencies are never redirected)
  --lang <en|zh>           Set language (default: en)
  --help                   Show this help message

Examples:
  mars create my-project              # Interactive mode (default)
  mars create my-project -n           # Non-interactive mode (default platforms)
  mars create my-project --from ./path/to/template
  mars update                         # Update from default template
  mars update --template ./path/to/template  # Update from local template
  mars dev --platform web
  mars build --platform android
  mars init
  mars init --docker                  # API runs in a container: no host JDK/Maven
  mars init --registry cn             # Install tools from mainland-China mirrors
  mars clean
`);
}

function showCreateUsage() {
  console.log(`
Usage: mars create <project-name> [options]

Options:
  --template <url>        Use a custom git repository as template
  --from <path>           Use a local directory as template
  -n, --non-interactive   Non-interactive mode (use default platforms)

Examples:
  mars create my-project              # Interactive mode (default)
  mars create my-project -n           # Non-interactive mode
  mars create my-project --template https://github.com/user/template.git
  mars create my-project --from ./path/to/template
`);
}

function findProjectRoot(dir = process.cwd()) {
  const markers = ['package.json', 'AGENTS.md', 'turbo.json'];
  let current = dir;
  while (current !== path.dirname(current)) {
    if (markers.some(m => fs.existsSync(path.join(current, m)))) {
      return current;
    }
    current = path.dirname(current);
  }
  return null;
}

function loadPlatformsConfig(rootDir) {
  const configPath = path.join(rootDir, 'platforms.json');
  if (fs.existsSync(configPath)) {
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  }
  return null;
}

function getPlatformDir(rootDir, platform) {
  const config = loadPlatformsConfig(rootDir);
  if (config && config.platforms) {
    for (const group of Object.values(config.platforms)) {
      if (group[platform] && group[platform].dir) {
        return group[platform].dir;
      }
    }
  }
  return `apps/${platform}`;
}

function getEnabledPlatforms(config) {
  if (!config || !config.platforms) return [];
  const platforms = [];
  for (const [category, group] of Object.entries(config.platforms)) {
    for (const [name, info] of Object.entries(group)) {
      if (info.enabled) {
        const hosts = info.hosts || DEFAULT_PLATFORMS.find(p => p.name === name)?.hosts || null;
        platforms.push({ name, ...info, hosts, hostSupported: isHostSupported(hosts) });
      }
    }
  }
  return platforms;
}

// Drops platforms the current machine cannot build. An explicit --platform is a
// hard error (the user asked for something impossible), while `all` only warns
// so that a mixed project still builds whatever it can on this host.
function filterPlatformsByHost(platforms, platform) {
  const blocked = platforms.filter(p => p.hostSupported === false);
  if (blocked.length === 0) return platforms;

  if (platform !== 'all') {
    const target = blocked.find(p => p.name === platform);
    if (target) {
      console.error(`\n${t('host-blocked', {
        platform: target.name,
        hosts: hostLabel(target.hosts),
        host: hostLabel([getCurrentHost()]),
      })}`);
      process.exit(1);
    }
  } else {
    console.log(`\n${t('host-skipped', {
      host: hostLabel([getCurrentHost()]),
      list: blocked.map(p => p.name).join(', '),
    })}`);
  }

  return platforms.filter(p => p.hostSupported !== false);
}

// `extraEnv` is merged on top of the inherited environment for this single
// subprocess only. It is how a registry profile reaches the tool installers
// without leaking into the parent shell or into unrelated commands: the
// override is passed at the call sites that actually download tools and goes
// nowhere else.
function run(command, cwd, stdio = 'inherit', extraEnv = null) {
  console.log(`\n> ${command}`);
  try {
    const env = extraEnv ? { ...process.env, ...extraEnv } : process.env;
    execSync(command, { cwd, stdio, shell: true, env });
    return true;
  } catch (e) {
    return false;
  }
}

// The Gradle wrapper ships as two files and neither name works on both hosts.
// A bare `gradlew` is not on PATH for a POSIX shell, and `./gradlew` is the
// extension-less script that cmd.exe cannot execute -- so the invocation has to
// be chosen per platform rather than written once. Every gradlew call site goes
// through here: the three that existed before this helper had drifted to three
// different spellings, two of which only ran on one OS.
function gradlew(task) {
  return process.platform === 'win32'
    ? `gradlew.bat ${task}`
    : `./gradlew ${task}`;
}

function spawnProcess(command, args, cwd) {
  const child = spawn(command, args, {
    cwd,
    stdio: 'inherit',
    shell: true,
  });
  child.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      process.exit(code);
    }
  });
  return child;
}

function parseCreateArgs(args) {
  if (args.length === 0 || args[0].startsWith('-')) {
    showCreateUsage();
    process.exit(1);
  }

  const projectName = args[0];
  const templateIndex = args.indexOf('--template');
  const templateUrl = templateIndex > -1 ? args[templateIndex + 1] : null;
  const fromIndex = args.indexOf('--from');
  const fromPath = fromIndex > -1 ? args[fromIndex + 1] : null;
  const interactive = !args.includes('--non-interactive') && !args.includes('-n');

  return { projectName, templateUrl, fromPath, interactive };
}

function copyDir(src, dest, exclude = new Set(['.git', 'node_modules', '.gradle', 'build', 'dist', '.turbo', '.idea'])) {
  const srcReal = fs.realpathSync(src);
  
  if (fs.existsSync(dest)) {
    const destReal = fs.realpathSync(dest);
    if (srcReal === destReal) {
      return;
    }
  }

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    if (exclude.has(entry.name)) continue;

    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath, exclude);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function replaceInFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf-8');
  for (const [from, to] of replacements) {
    content = content.split(from).join(to);
  }
  fs.writeFileSync(filePath, content, 'utf-8');
}

function replaceProjectName(targetDir, projectName) {
  const replacements = [
    ['"name": "marsquakes"', `"name": "${projectName}"`],
    ['"project_name": "Marsquakes"', `"project_name": "${projectName}"`],
    ['# Marsquakes - AGENTS.md', `# ${projectName} - AGENTS.md`],
    ['- **Project Name**: Marsquakes', `- **Project Name**: ${projectName}`],
    ['- **项目名称**: Marsquakes', `- **项目名称**: ${projectName}`],
    ['Marsquakes/', `${projectName}/`],
    ['Marsquakes - Multi-platform Project', `${projectName} - Multi-platform Project`],
    ['Marsquakes - 多平台项目', `${projectName} - 多平台项目`],
    // Compose rejects capitals in a project name, so this one is lower-cased
    // rather than passed through verbatim.
    [
      'COMPOSE_PROJECT_NAME=marsquakes',
      `COMPOSE_PROJECT_NAME=${projectName.toLowerCase()}`,
    ],
  ];

  const filesToReplace = [
    'package.json',
    'platforms.json',
    'AGENTS.md',
    '.env.example',
    '.env.example.cn',
    'apps/android/AGENTS.md',
    'apps/web/AGENTS.md',
    'apps/web-admin/AGENTS.md',
    'apps/ios/AGENTS.md',
    'apps/api/AGENTS.md',
    'apps/windows/AGENTS.md',
    'apps/linux/AGENTS.md',
    'apps/macos/AGENTS.md',
    'apps/desktop/AGENTS.md',
  ];

  for (const file of filesToReplace) {
    replaceInFile(path.join(targetDir, file), replacements);
  }
}

function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

async function selectPlatforms(platforms) {
  // A platform the current host cannot build is never pre-selected, otherwise
  // pressing Enter straight away would produce a project that cannot be built.
  const selected = platforms.map(p => ({
    ...p,
    selectable: !!p.enabled && p.hostSupported !== false,
    selected: p.default && p.hostSupported !== false,
  }));

  const hasTTY = process.stdout.isTTY && process.stdin.isTTY;

  if (hasTTY) {
    return selectPlatformsInteractive(selected);
  } else {
    return selectPlatformsSimple(selected);
  }
}

// Renders the trailing marker for one row: either the developing status or the
// host requirement, whichever is the reason it cannot be selected.
function platformSuffix(p) {
  if (!p.enabled) return ` [${p.status || t('status-developing')}]`;
  if (p.hostSupported === false) return ` [${t('host-requires', { hosts: hostLabel(p.hosts) })}]`;
  return '';
}

// The selector is the only place where the user still gets to decide what lands
// on their machine, so it is where the consequence has to be visible. Ticking a
// row is not just "copy this directory": `mars init` later derives the toolchain
// set from exactly these ticks, so a row that costs a JDK download must say so
// before the tick, not after.
//
// Labels come from TOOL_SPECS rather than PLATFORM_TOOLCHAIN's raw keys so the
// selector and `mars init`'s own report name the same things ("JDK", not "java").
function toolLabels(names) {
  return names.map(name => (TOOL_SPECS[name] ? TOOL_SPECS[name].label : name));
}

function platformToolchainLine(p) {
  const tools = PLATFORM_TOOLCHAIN[p.name] || [];
  if (tools.length === 0) return null;
  return t('platform-toolchain', { list: toolLabels(tools).join(', ') });
}

// Summarises the whole selection, deduplicated the same way requiredTools does,
// because api and android both want a JDK and listing it twice would suggest two
// downloads. Takes the already-ticked list, so the live selector and the
// post-confirmation summary in createProject can share it.
function selectionToolchainLine(tickedPlatforms) {
  const tools = requiredTools(tickedPlatforms);
  if (tools.length === 0) return t('selection-toolchain-none');
  return t('selection-toolchain', { list: toolLabels(tools).join(', ') });
}

async function selectPlatformsInteractive(selected) {
  let cursor = 0;
  let resolveFn = null;
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
    crlfDelay: Infinity,
  });
  
  const render = () => {
    process.stdout.write('\x1B[2J\x1B[0f');
    console.log(`\n${t('select-platforms')}\n`);
    console.log(`   ${t('select-hint')}\n`);
    console.log(`   ${t('disabled-hint')}`);
    console.log(`   ${t('host-current', { host: hostLabel([getCurrentHost()]) })}`);
    if (selected.some(p => p.enabled && p.hostSupported === false)) {
      console.log(`   ${t('host-hint')}`);
    }
    console.log(`   ${t('select-toolchain-hint')}`);
    console.log('');
    
    const categoryGroups = {};
    selected.forEach(p => {
      if (!categoryGroups[p.category]) {
        categoryGroups[p.category] = [];
      }
      categoryGroups[p.category].push(p);
    });
    
    const categoryLabels = {
      web: t('category-web'),
      api: t('category-api'),
      mobile: t('category-mobile'),
      desktop: t('category-desktop'),
    };
    
    for (const [category, platforms] of Object.entries(categoryGroups)) {
      console.log(`\n  ${categoryLabels[category]}:`);
      platforms.forEach((p, idx) => {
        const globalIdx = selected.findIndex(s => s.name === p.name);
        const isCursor = globalIdx === cursor;
        const isDisabled = !p.selectable;
        const checkbox = p.selected ? '[✓]' : '[ ]';
        const prefix = isCursor ? ' → ' : '   ';
        
        let line = `${prefix}${checkbox} ${p.label}`;
        if (isDisabled) {
          line = `\x1B[90m${prefix}${checkbox} ${p.label}${platformSuffix(p)}\x1B[0m`;
        }
        
        console.log(line);
        const descPrefix = isCursor && !isDisabled ? '      ' : '         ';
        if (p.description) {
          console.log(`${descPrefix}${p.description}`);
        }
        const toolLine = platformToolchainLine(p);
        if (toolLine) {
          console.log(`\x1B[90m${descPrefix}${toolLine}\x1B[0m`);
        }
      });
    }
    
    const selectedCount = selected.filter(p => p.selected).length;
    console.log(`\n  ${t('current-selection', { count: selectedCount })}`);
    console.log(`  ${selectionToolchainLine(selected.filter(p => p.selected))}`);
  };
  
  const cleanup = () => {
    rl.close();
    process.stdin.removeListener('keypress', handleKeypress);
  };
  
  const handleKeypress = (_, key) => {
    if (!key) return;
    
    if (key.ctrl && key.name === 'c') {
      cleanup();
      console.log(`\n\n${t('cancelled')}`);
      process.exit(0);
    }
    
    if (key.name === 'up') {
      cursor = Math.max(0, cursor - 1);
      render();
    } else if (key.name === 'down') {
      cursor = Math.min(selected.length - 1, cursor + 1);
      render();
    } else if (key.name === 'space') {
      if (!selected[cursor].selectable) return;
      selected[cursor].selected = !selected[cursor].selected;
      render();
    } else if (key.name === 'return') {
      cleanup();
      resolveFn(selected.filter(p => p.selected));
    } else if (key.name === 'escape') {
      cleanup();
      resolveFn(selected.filter(p => p.selected));
    }
  };
  
  try {
    process.stdin.setRawMode(true);
    readline.emitKeypressEvents(process.stdin);
  } catch (e) {
    rl.close();
    return selectPlatformsSimple(selected);
  }
  
  rl.on('close', () => {
    try {
      process.stdin.setRawMode(false);
    } catch (e) {}
  });
  
  process.stdin.on('keypress', handleKeypress);
  
  return new Promise(resolve => {
    resolveFn = resolve;
    render();
  });
}

async function selectPlatformsSimple(selected) {
  console.log(`\n${t('select-platforms')}\n`);
  console.log(`   ${t('disabled-hint')}`);
  console.log(`   ${t('host-current', { host: hostLabel([getCurrentHost()]) })}`);
  if (selected.some(p => p.enabled && p.hostSupported === false)) {
    console.log(`   ${t('host-hint')}`);
  }
  console.log(`   ${t('select-toolchain-hint')}`);
  console.log('');
  
  const categoryGroups = {};
  selected.forEach(p => {
    if (!categoryGroups[p.category]) {
      categoryGroups[p.category] = [];
    }
    categoryGroups[p.category].push(p);
  });
  
  const categoryLabels = {
    web: t('category-web'),
    api: t('category-api'),
    mobile: t('category-mobile'),
    desktop: t('category-desktop'),
  };
  
  let index = 1;
  const indexMap = [];
  
  for (const [category, platforms] of Object.entries(categoryGroups)) {
    console.log(`\n  ${categoryLabels[category]}:`);
    platforms.forEach(p => {
      const checkbox = p.selected ? '[✓]' : '[ ]';
      let line = `   ${index}. ${checkbox} ${p.label}`;
      if (!p.selectable) {
        line = `\x1B[90m   ${index}. ${checkbox} ${p.label}${platformSuffix(p)}\x1B[0m`;
      }
      console.log(line);
      if (p.description) {
        console.log(`         ${p.description}`);
      }
      const toolLine = platformToolchainLine(p);
      if (toolLine) {
        console.log(`\x1B[90m         ${toolLine}\x1B[0m`);
      }
      indexMap.push({ index, platform: p });
      index++;
    });
  }
  
  console.log(`\n  ${t('input-hint')}`);
  console.log(`   ${t('input-select')}`);
  console.log(`   ${t('input-select-all')}`);
  console.log(`   ${t('input-deselect-all')}`);
  console.log(`   ${t('input-default')}`);
  
  const answer = await prompt(`\n  ${t('enter-selection')}`);
  
  if (!answer.trim()) {
    return selected.filter(p => p.selected);
  }
  
  const inputs = answer.trim().toLowerCase().split(/\s+/);
  
  for (const input of inputs) {
    if (input === 'a') {
      selected.forEach(p => { if (p.selectable) p.selected = true; });
    } else if (input === 'n') {
      selected.forEach(p => p.selected = false);
    } else {
      const num = parseInt(input, 10);
      if (!isNaN(num)) {
        const item = indexMap.find(i => i.index === num);
        if (item) {
          const p = selected.find(s => s.name === item.platform.name);
          if (p && p.selectable) {
            p.selected = !p.selected;
          }
        }
      }
    }
  }
  
  console.log(`\n${t('selected-modules', { count: selected.filter(p => p.selected).length })}`);
  selected.filter(p => p.selected).forEach(p => console.log(`   - ${p.label}`));
  
  return selected.filter(p => p.selected);
}

function updatePlatformsConfig(targetDir, selectedPlatforms) {
  const configPath = path.join(targetDir, 'platforms.json');
  if (!fs.existsSync(configPath)) return;
  
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  
  for (const [category, group] of Object.entries(config.platforms)) {
    for (const [name] of Object.entries(group)) {
      const selected = selectedPlatforms.some(p => p.name === name);
      config.platforms[category][name].enabled = selected;
      if (config.platforms[category][name].default !== undefined) {
        config.platforms[category][name].default = selected;
      }
    }
  }
  
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
}

function copySelectedPlatforms(srcDir, destDir, selectedPlatforms) {
  const appsSrcDir = path.join(srcDir, 'apps');
  const appsDestDir = path.join(destDir, 'apps');
  
  if (!fs.existsSync(appsSrcDir)) return;
  
  const selectedNames = new Set(selectedPlatforms.map(p => p.name));
  
  if (!fs.existsSync(appsDestDir)) {
    fs.mkdirSync(appsDestDir, { recursive: true });
  }
  
  const entries = fs.readdirSync(appsSrcDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && selectedNames.has(entry.name)) {
      const srcPath = path.join(appsSrcDir, entry.name);
      const destPath = path.join(appsDestDir, entry.name);
      console.log(`   ${t('copy-platform', { name: entry.name })}`);
      copyDir(srcPath, destPath, new Set(['.git', 'node_modules', '.gradle', 'build', 'dist', '.turbo', '.idea']));
    }
  }
}

async function createProject(args) {
  const { projectName, templateUrl, fromPath, interactive } = parseCreateArgs(args);
  const targetDir = path.resolve(process.cwd(), projectName);

  if (fs.existsSync(targetDir)) {
    console.error(`\n❌ Error: Directory "${projectName}" already exists.`);
    process.exit(1);
  }

  console.log(`\n📦 Creating project "${projectName}"...\n`);

  let templateDir;
  let isTempDir = false;

  if (fromPath) {
    templateDir = path.resolve(fromPath);
    if (!fs.existsSync(templateDir)) {
      console.error(`\n❌ Error: Template directory "${fromPath}" does not exist.`);
      process.exit(1);
    }
    console.log(`📁 Using local template: ${templateDir}`);
  } else if (templateUrl) {
    templateDir = path.join(require('os').tmpdir(), `marsquakes-template-${Date.now()}`);
    isTempDir = true;
    console.log(`🌐 Cloning template from: ${templateUrl}`);
    try {
      execSync(`git clone --depth 1 ${templateUrl} "${templateDir}"`, { stdio: 'inherit' });
    } catch (e) {
      console.error('\n❌ Failed to clone template. Please check the URL or your network connection.');
      if (fs.existsSync(templateDir)) {
        fs.rmSync(templateDir, { recursive: true, force: true });
      }
      process.exit(1);
    }
  } else {
    const currentDir = process.cwd();
    const isMarsquakesProject = ['package.json', 'AGENTS.md', 'turbo.json'].every(file => 
      fs.existsSync(path.join(currentDir, file))
    );
    
    if (isMarsquakesProject) {
      templateDir = currentDir;
      console.log(`📁 Using current directory as template: ${templateDir}`);
    } else {
      templateDir = path.join(require('os').tmpdir(), `marsquakes-template-${Date.now()}`);
      isTempDir = true;
      console.log(`🌐 Cloning template from: ${DEFAULT_TEMPLATE}`);
      try {
        execSync(`git clone --depth 1 ${DEFAULT_TEMPLATE} "${templateDir}"`, { stdio: 'inherit' });
      } catch (e) {
        console.error('\n❌ Failed to clone template. Please check the URL or your network connection.');
        if (fs.existsSync(templateDir)) {
          fs.rmSync(templateDir, { recursive: true, force: true });
        }
        process.exit(1);
      }
    }
  }

  const configPath = path.join(templateDir, 'platforms.json');
  let platformsConfig = null;
  if (fs.existsSync(configPath)) {
    platformsConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  }
  const allPlatforms = getPlatformsFromConfig(platformsConfig);

  let selectedPlatforms = allPlatforms.filter(p => p.default && p.hostSupported !== false);

  if (interactive) {
    console.log(`\n${t('enter-interactive')}`);
    selectedPlatforms = await selectPlatforms(allPlatforms);
    console.log(`\n${t('selected-modules', { count: selectedPlatforms.length })}`);
    selectedPlatforms.forEach(p => console.log(`   - ${p.label}`));
  } else {
    console.log(`\n${t('using-default')}`);
    if (selectedPlatforms.length === 0 && allPlatforms.some(p => p.default)) {
      console.log(`\n${t('host-none-selected', { host: hostLabel([getCurrentHost()]) })}`);
      process.exit(1);
    }
    console.log(`   ${t('selected-count', { count: selectedPlatforms.length, list: selectedPlatforms.map(p => p.label).join(', ') })}`);
    console.log(`   ${t('skip-interactive')}`);
  }

  // Printed after both branches, because `-n` skips the selector entirely and
  // would otherwise be the one path that never says what `mars init` is about to
  // install. The set is derived from the same selection that is written into
  // platforms.json below, so this line and `mars init`'s later report cannot
  // disagree.
  console.log(`   ${selectionToolchainLine(selectedPlatforms)}`);

  console.log(`\n${t('creating-directory')}`);
  fs.mkdirSync(targetDir, { recursive: true });

  const sigintHandler = () => {
    console.log(`\n\n${t('cancelled-cleanup')}`);
    if (fs.existsSync(targetDir)) {
      fs.rmSync(targetDir, { recursive: true, force: true });
    }
    if (isTempDir && fs.existsSync(templateDir)) {
      fs.rmSync(templateDir, { recursive: true, force: true });
    }
    process.exit(0);
  };
  process.on('SIGINT', sigintHandler);

  console.log(t('copying-base'));
  const excludeApps = new Set(['.git', 'node_modules', '.gradle', 'build', 'dist', '.turbo', '.idea', projectName, 'apps']);
  copyDir(templateDir, targetDir, excludeApps);

  console.log(t('copying-platforms'));
  copySelectedPlatforms(templateDir, targetDir, selectedPlatforms);

  process.removeListener('SIGINT', sigintHandler);

  console.log(t('updating-config'));
  updatePlatformsConfig(targetDir, selectedPlatforms);

  console.log(`\n${t('customizing-name')}`);
  replaceProjectName(targetDir, projectName);

  if (isTempDir && fs.existsSync(templateDir)) {
    fs.rmSync(templateDir, { recursive: true, force: true });
  }

  const gitDir = path.join(targetDir, '.git');
  if (fs.existsSync(gitDir)) {
    fs.rmSync(gitDir, { recursive: true, force: true });
  }
  console.log(`\n${t('initializing-git')}`);
  try {
    execSync('git init', { cwd: targetDir, stdio: 'pipe' });
    execSync('git config user.email "admin@example.com"', { cwd: targetDir, stdio: 'pipe' });
    execSync('git config user.name "Admin"', { cwd: targetDir, stdio: 'pipe' });
    execSync('git add .', { cwd: targetDir, stdio: 'pipe' });
    execSync('git commit -m "init: create project from template"', { cwd: targetDir, stdio: 'pipe' });
  } catch (e) {
    console.warn('\n⚠️  Git initialization skipped (non-fatal). You can manually run git init later.');
  }

  console.log(`\n${t('project-created', { name: projectName })}\n`);
  console.log('Selected platforms:');
  selectedPlatforms.forEach(p => console.log(`   ✓ ${p.label}`));
  console.log('');
  console.log(t('next-steps'));
  console.log(`  cd ${projectName}`);
  console.log('  mars init');
  console.log('  mars dev');
  console.log('');
}

function checkDocker() {
  try {
    execSync('docker --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function dockerImageExists(imageName) {
  try {
    execSync(`docker inspect ${imageName}`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

const DOCKER_PORTS = {
  web: '3100:3100',
  'web-admin': '3100:3100',
  api: '8080:8080',
};

// Dockerfile variants are named after who produces the artifact, not after a
// CLI verb:
//   Dockerfile        no compile stage, consumes an existing artifact
//                     (default entry point, pipeline scenario)
//   Dockerfile.build  self-contained multi-stage compile, works on a clean
//                     checkout
//   Dockerfile.dev    hot reload inside the container, paired with a volume
//                     mount (default for dev mode)
const DOCKERFILE_VARIANTS = {
  dev: ['Dockerfile.dev', 'Dockerfile.build', 'Dockerfile'],
  build: ['Dockerfile.build', 'Dockerfile'],
  artifact: ['Dockerfile'],
};

function resolveDockerfile(rootDir, platform, mode) {
  const platformDir = getPlatformDir(rootDir, platform);
  const candidates = DOCKERFILE_VARIANTS[mode] || DOCKERFILE_VARIANTS.build;

  // Fall back in priority order: without a dedicated variant, use the bare
  // Dockerfile that has no compile stage.
  let fileName = candidates[candidates.length - 1];
  for (const name of candidates) {
    if (fs.existsSync(path.join(rootDir, platformDir, name))) {
      fileName = name;
      break;
    }
  }

  return {
    platformDir,
    dockerfile: path.join(rootDir, platformDir, fileName),
    relativePath: `${platformDir}/${fileName}`,
  };
}

// Build-time knobs that .env is allowed to feed into `docker build`.
// Keep this list explicit: .env also holds database passwords, and forwarding it
// wholesale would bake secrets into image layers, where `docker history` shows
// them in plain text.
const DOCKER_BUILD_ARG_KEYS = ['NPM_REGISTRY', 'MAVEN_MIRROR_URL', 'HTTP_PROXY', 'HTTPS_PROXY', 'NO_PROXY'];

// Minimal .env reader. `docker compose` parses .env by itself, but a bare
// `docker build` does not, so the CLI has to do it to keep both paths
// equivalent. Deliberately not a full dotenv implementation: this only needs to
// handle the `KEY=value` lines, comments and optional quotes that .env.example
// actually uses.
function loadDotEnv(rootDir) {
  const envPath = path.join(rootDir, '.env');
  if (!fs.existsSync(envPath)) return {};

  const result = {};
  for (const rawLine of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const eq = line.indexOf('=');
    if (eq === -1) continue;

    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    // Strip one layer of matching quotes; an unquoted value keeps any inner '#'
    // because .env has no trailing-comment syntax.
    if (value.length >= 2 && ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))) {
      value = value.slice(1, -1);
    }
    if (key) result[key] = value;
  }
  return result;
}

// Turn the whitelisted .env entries into --build-arg flags. Empty values are
// skipped so the Dockerfile's own ARG default stays in effect instead of being
// overridden with an empty string.
function resolveBuildArgs(rootDir) {
  const env = loadDotEnv(rootDir);
  const flags = [];
  const used = [];

  for (const key of DOCKER_BUILD_ARG_KEYS) {
    const value = env[key];
    if (value === undefined || value === '') continue;
    flags.push(`--build-arg ${key}="${value}"`);
    used.push(`${key}=${value}`);
  }

  return { flags, used };
}

function runDocker(rootDir, platform, mode) {
  if (!checkDocker()) {
    console.error('\n❌ Docker is not installed or not running.');
    console.log('   Please install Docker: https://docs.docker.com/get-docker/');
    process.exit(1);
  }

  let targetPlatform = platform;

  // For platform=all, pick the first enabled platform that ships a Dockerfile
  // instead of hard-coding one.
  if (platform === 'all') {
    const candidates = getEnabledPlatforms(loadPlatformsConfig(rootDir));
    const hit = candidates.find((p) => fs.existsSync(resolveDockerfile(rootDir, p.name, mode).dockerfile));
    if (!hit) {
      console.error(`\n❌ No enabled platform provides a Dockerfile (mode: ${mode}).`);
      console.log('   Please specify one explicitly, e.g. --platform api');
      process.exit(1);
    }
    targetPlatform = hit.name;
    console.log(`\nℹ️  --platform not specified, using "${targetPlatform}"`);
  }

  // Dockerfiles live in each platform's own directory, but the build context
  // is still the repository root.
  const { dockerfile, relativePath } = resolveDockerfile(rootDir, targetPlatform, mode);

  if (!fs.existsSync(dockerfile)) {
    console.error(`\n❌ Dockerfile not found for platform "${targetPlatform}" (mode: ${mode})`);
    console.log(`   Expected: ${dockerfile}`);
    process.exit(1);
  }

  const imageName = `marsquakes/${targetPlatform}:${mode}`;
  const containerName = `marsquakes-${targetPlatform}-${mode}`;

  console.log(`\n🐳 Building Docker image: ${imageName}`);
  console.log(`   Dockerfile: ${relativePath} (context: repo root)`);

  const { flags: buildArgFlags, used: buildArgSummary } = resolveBuildArgs(rootDir);
  if (buildArgSummary.length > 0) {
    console.log(`   Build args from .env: ${buildArgSummary.join(', ')}`);
  }

  const buildCmd = ['docker build', ...buildArgFlags, `-f "${dockerfile}"`, `-t ${imageName}`, `"${rootDir}"`].join(' ');

  try {
    execSync(buildCmd, { stdio: 'inherit' });
  } catch (e) {
    console.error('\n❌ Docker build failed.');
    process.exit(1);
  }

  console.log(`\n🚀 Running Docker container: ${containerName}`);

  const dockerArgs = ['run', '--rm', '--name', containerName];

  if (mode === 'dev') {
    dockerArgs.push('-it');
    dockerArgs.push('-v', `${rootDir}:/app`);
  }

  if (DOCKER_PORTS[targetPlatform]) {
    dockerArgs.push('-p', DOCKER_PORTS[targetPlatform]);
  }

  dockerArgs.push(imageName);

  try {
    execSync(`docker ${dockerArgs.join(' ')}`, { stdio: 'inherit' });
  } catch (e) {
    console.error('\n❌ Docker run failed.');
    process.exit(1);
  }
}

const PLATFORM_COMMANDS = {
  dev: {
    web: { cmd: 'pnpm', args: ['dev', '--filter=web'], native: false },
    'web-admin': { cmd: 'pnpm', args: ['dev', '--filter=web-admin'], native: false },
    desktop: { cmd: 'pnpm', args: ['dev', '--filter=desktop'], native: false },
    android: { cmd: null, script: 'gradlew installDebug', native: true },
    ios: { cmd: null, script: 'xcodebuild', native: true },
    api: { cmd: null, script: null, native: true },
    windows: { cmd: null, script: null, native: true },
    linux: { cmd: null, script: null, native: true },
    macos: { cmd: null, script: null, native: true },
  },
  build: {
    web: { cmd: 'pnpm', args: ['build', '--filter=web'], native: false },
    'web-admin': { cmd: 'pnpm', args: ['build', '--filter=web-admin'], native: false },
    desktop: { cmd: 'pnpm', args: ['build', '--filter=desktop'], native: false },
    android: { cmd: null, script: 'gradlew assembleRelease', native: true },
    ios: { cmd: null, script: 'xcodebuild', native: true },
    api: { cmd: null, script: null, native: true },
    windows: { cmd: null, script: null, native: true },
    linux: { cmd: null, script: null, native: true },
    macos: { cmd: null, script: null, native: true },
  },
};

function devCommand(args) {
  const rootDir = findProjectRoot();
  if (!rootDir) {
    console.error('\n❌ Error: Not in a Marsquakes project (no package.json / AGENTS.md found).');
    process.exit(1);
  }

  const platformIndex = args.indexOf('--platform');
  const platform = platformIndex > -1 ? args[platformIndex + 1] : 'all';
  const useDocker = args.includes('--docker');

  const config = loadPlatformsConfig(rootDir);
  const enabledPlatforms = filterPlatformsByHost(getEnabledPlatforms(config), platform);
  const workspacePlatforms = enabledPlatforms.filter(p => !['android', 'ios', 'windows', 'linux', 'macos'].includes(p.name));
  const nativePlatforms = enabledPlatforms.filter(p => ['android', 'ios', 'windows', 'linux', 'macos'].includes(p.name));

  if (useDocker) {
    runDocker(rootDir, platform, 'dev');
    return;
  }

  console.log(`\n🚀 Starting development servers...\n`);

  const children = [];

  const workspaceTargets = platform === 'all'
    ? workspacePlatforms.map(p => p.name)
    : (workspacePlatforms.some(p => p.name === platform) ? [platform] : []);

  if (workspaceTargets.length > 0) {
    for (const target of workspaceTargets) {
      const filterFlag = `--filter=${target}`;
      const child = spawnProcess('pnpm', ['dev', filterFlag], rootDir);
      children.push(child);
    }
  }

  const nativeTargets = platform === 'all'
    ? nativePlatforms
    : (nativePlatforms.some(p => p.name === platform) ? nativePlatforms.filter(p => p.name === platform) : []);

  for (const target of nativeTargets) {
    const platformCmd = PLATFORM_COMMANDS.dev[target.name];
    if (!platformCmd || !platformCmd.script) {
      console.log(t('platform-pending', { name: target.name, desc: target.description }));
      continue;
    }
    const targetDir = path.join(rootDir, target.dir);
    if (fs.existsSync(path.join(targetDir, platformCmd.script.split(' ')[0]))) {
      const child = spawnProcess(platformCmd.script, [], targetDir);
      children.push(child);
    } else {
      console.log(t('platform-not-ready', { name: target.name, desc: target.description }));
    }
  }

  if (children.length === 0) {
    if (platform !== 'all') {
      console.error(`\n❌ Unknown platform: "${platform}"`);
      console.log(`Enabled platforms: ${enabledPlatforms.map(p => p.name).join(', ') || 'none'}`);
    } else {
      console.log('No platforms ready to start.');
    }
    process.exit(1);
  }

  process.on('SIGINT', () => {
    console.log('\n\n🛑 Stopping all development servers...');
    children.forEach(c => c.kill());
    process.exit(0);
  });
}

function buildCommand(args) {
  const rootDir = findProjectRoot();
  if (!rootDir) {
    console.error('\n❌ Error: Not in a Marsquakes project.');
    process.exit(1);
  }

  const platformIndex = args.indexOf('--platform');
  const platform = platformIndex > -1 ? args[platformIndex + 1] : 'all';
  const useDocker = args.includes('--docker');

  const config = loadPlatformsConfig(rootDir);
  const enabledPlatforms = filterPlatformsByHost(getEnabledPlatforms(config), platform);

  if (useDocker) {
    runDocker(rootDir, platform, 'build');
    return;
  }

  console.log(`\n🔨 Building project...\n`);

  if (platform === 'all' || platform === 'web') {
    if (enabledPlatforms.some(p => p.name === 'web')) {
      run('pnpm build --filter=web', rootDir);
    }
  }

  if (platform === 'all' || platform === 'web-admin') {
    if (enabledPlatforms.some(p => p.name === 'web-admin')) {
      run('pnpm build --filter=web-admin', rootDir);
    }
  }

  if (platform === 'all' || platform === 'desktop') {
    if (enabledPlatforms.some(p => p.name === 'desktop')) {
      run('pnpm build --filter=desktop', rootDir);
    }
  }

  if (platform === 'all' || platform === 'android') {
    if (enabledPlatforms.some(p => p.name === 'android')) {
      const androidDir = path.join(rootDir, 'apps', 'android');
      if (fs.existsSync(path.join(androidDir, 'gradlew'))) {
        run('.\\gradlew assembleRelease', androidDir);
      }
    }
  }

  for (const p of enabledPlatforms) {
    if (['web', 'web-admin', 'desktop', 'android'].includes(p.name)) continue;
    if (platform !== 'all' && platform !== p.name) continue;
    console.log(t('platform-not-supported', { name: p.name, desc: p.description }));
  }

  console.log('\n✅ Build complete!\n');
}

// Which extra toolchain each platform needs, beyond the base Node/pnpm/git that
// every project needs. Keep this table in sync with `add_scenario()` in *both*
// .agents/skills/marsquakes-setup/scripts/detect-env.sh and its .ps1 twin --
// those scripts accept these same platform names so the two never need separate
// mappings, and a change made to only one of the pair goes unnoticed until a
// user on the other OS hits it.
//
// The empty entries are deliberate, not unfinished: web and web-admin build with
// the base tools alone, and ios / windows / linux / macos build with their own OS
// toolchain (Xcode, MSVC, gcc), which is not something mise installs.
const PLATFORM_TOOLCHAIN = {
  api: ['docker', 'java', 'maven'],
  // android-cli is additive, not a replacement for the JDK: Gradle still runs on
  // the host, so a project that has the CLI but no JDK cannot build.
  android: ['java', 'android-cli'],
  desktop: ['rust'],
  web: [],
  'web-admin': [],
  ios: [],
  windows: [],
  linux: [],
  macos: [],
};

// Floors are the same ones documented in references/install-matrix.md.
//
// `probe` runs with 2>&1 because `java -version` prints to stderr while still
// exiting 0, so capturing stdout alone reports a working JDK as missing.
//
// `pin` is the mise argument. Docker has none: it is a system service, not a
// language runtime, so mise cannot install it and this command must not pretend
// otherwise -- it reports and points at the matrix instead.
//
// `install` is the third path, for tools that mise cannot manage but that ship
// an official user-scoped installer. Only the Android CLI uses it today, and it
// is what makes `pin: null` mean "report only" rather than "cannot install":
// the two fields are read separately in ensureToolchain.
//
// The Android CLI's floor is null on purpose. It has no published version
// contract to hold a project to, and `android -V` may print a build string with
// no dotted number in it -- with a floor set, a working install would be
// reported as missing and reinstalled on every `mars init`.
const TOOL_SPECS = {
  java: { label: 'JDK', probe: 'java -version 2>&1', floor: '17', pin: 'java@temurin-17' },
  maven: { label: 'Maven', probe: 'mvn -v 2>&1', floor: '3.9.0', pin: 'maven@3.9' },
  rust: { label: 'Rust', probe: 'rustc --version 2>&1', floor: '1.77.0', pin: 'rust' },
  docker: { label: 'Docker', probe: 'docker --version 2>&1', floor: '20.10.0', pin: null },
  'android-cli': {
    label: 'Android CLI',
    probe: 'android -V 2>&1',
    floor: null,
    pin: null,
    install: installAndroidCli,
  },
};

// Registry profiles decide where the *tool installers* download from, and
// nothing else. Each value is an environment block that is merged into the
// subprocess only while a tool is being installed -- never into `pnpm
// install`, never into the parent shell, never into the built project.
//
// `default` carries no overrides, so every installer uses its own upstream.
// `cn` points the installers that accept a mirror at mainland-China mirrors;
// every URL below was verified to answer before it was added.
//
// Not every tool can be mirrored, and the gaps are properties of the upstream
// projects rather than oversights here:
// - mise's Java core fetches its release metadata from a hardcoded
//   mise-java.jdx.dev URL and exposes no mirror option, so the Temurin JDK
//   tarball still comes from upstream.
// - the mise-maven plugin hardcodes repo.maven.apache.org in bin/install and
//   does not read MAVEN_MIRROR_URL, so the Maven distribution still comes
//   from upstream; that variable does redirect Maven once it is running
//   (dependency resolution inside the build).
// - Google publishes no Android CLI/SDK mirror, so dl.google.com is used.
const REGISTRY_PROFILES = {
  default: {},
  cn: {
    // npm-based global installs (and any npm the installers shell out to).
    npm_config_registry: 'https://registry.npmmirror.com',
    NPM_REGISTRY: 'https://registry.npmmirror.com',
    // mise core reads this for the Node runtime tarball.
    MISE_NODE_MIRROR_URL: 'https://mirrors.cloud.tencent.com/nodejs-release',
    // rustup (run by mise's Rust core) honors these for the toolchain and
    // its own self-update.
    RUSTUP_DIST_SERVER: 'https://mirrors.tuna.tsinghua.edu.cn/rustup',
    RUSTUP_UPDATE_ROOT: 'https://mirrors.tuna.tsinghua.edu.cn/rustup/rustup',
    // crates.io index used while Rust build tools fetch crates. Sparse, so no
    // local git clone of the index is needed.
    CARGO_REGISTRIES_CRATES_IO_PROTOCOL: 'sparse',
    CARGO_REGISTRIES_CRATES_IO_INDEX: 'sparse+https://mirrors.aliyun.com/crates.io-index/',
    // Maven dependency resolution at build time (see the note above about the
    // distribution download).
    MAVEN_MIRROR_URL: 'https://maven.aliyun.com/repository/public',
  },
};

// Google publishes one binary per OS/arch triple under a fixed URL layout. These
// four keys were verified to exist with HTTP HEAD; `linux_arm64`, `mac_arm64`
// and `linux_aarch64` all return 404, so an unsupported host must say so rather
// than download a 404 page and call it a binary.
function androidCliTarget() {
  if (process.platform === 'win32') return 'windows_x86_64';
  if (process.platform === 'darwin') return process.arch === 'arm64' ? 'darwin_arm64' : 'darwin_x86_64';
  if (process.platform === 'linux' && process.arch === 'x64') return 'linux_x86_64';
  return null;
}

// Runs Google's own installer rather than reimplementing it. That is the point:
// the installer picks the right shell profile out of six candidates on POSIX and
// writes HKCU\Environment on Windows, and a local copy of that logic would be a
// second source of truth that drifts. It is downloaded to a file first instead
// of piped into a shell, so the script is on disk and auditable if it fails.
//
// No administrator rights are needed -- the installer is user-scoped
// ($HOME/.local/bin, or %USERPROFILE%\AppData\AndroidCLI).
function installAndroidCli() {
  const target = androidCliTarget();
  if (!target) {
    console.log(`   ${t('android-cli-unsupported', { host: `${process.platform}/${process.arch}` })}`);
    return false;
  }

  const isWindows = process.platform === 'win32';
  const script = isWindows ? 'install.cmd' : 'install.sh';
  const url = `https://dl.google.com/android/cli/latest/${target}/${script}`;
  const local = path.join(os.tmpdir(), `android-cli-${script}`);

  try {
    // curl is a hard dependency of the POSIX installer itself, and ships with
    // Windows 10+ as curl.exe, so requiring it adds no new constraint.
    execSync(`curl -fsSL "${url}" -o "${local}"`, { stdio: 'pipe', shell: true });
  } catch {
    console.log(`   ${t('android-cli-download-failed', { url })}`);
    return false;
  }

  const ok = run(isWindows ? `"${local}"` : `bash "${local}"`, process.cwd());
  try {
    fs.unlinkSync(local);
  } catch {
    // A leftover file in the temp dir is not worth failing the install over.
  }
  return ok;
}

// The installer writes PATH into HKCU\Environment (Windows) or a shell profile
// (POSIX), and neither reaches a process that is already running. So the CLI is
// invocable by name only in some *later* shell, which is exactly the shell that
// `mars init` is not. Hence: try PATH first, because a host that already had the
// CLI is the common case, then fall back to the user-scoped install locations.
//
// Several file names are probed rather than one guessed, so an upstream change of
// extension surfaces as "not found" instead of as a silent no-op.
function androidCliBinary() {
  try {
    execSync(process.platform === 'win32' ? 'where android' : 'command -v android', { stdio: 'pipe', shell: true });
    return 'android';
  } catch {
    // Not on this process's PATH; fall through to the known install locations.
  }

  const home = os.homedir();
  const candidates = process.platform === 'win32'
    ? ['android.exe', 'android.cmd', 'android.bat'].map(n => path.join(home, 'AppData', 'AndroidCLI', n))
    : [path.join(home, '.local', 'bin', 'android')];
  return candidates.find(p => fs.existsSync(p)) || null;
}

// Where the SDK goes. An existing ANDROID_HOME wins, because a machine that
// already has an SDK must not get a second one. Otherwise the conventional
// per-OS location is used -- the same path Android Studio picks, so the two
// agree instead of maintaining one SDK each.
function androidSdkHome() {
  const fromEnv = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
  if (fromEnv) return fromEnv;

  const home = os.homedir();
  if (process.platform === 'win32') {
    return path.join(process.env.LOCALAPPDATA || path.join(home, 'AppData', 'Local'), 'Android', 'Sdk');
  }
  if (process.platform === 'darwin') return path.join(home, 'Library', 'Android', 'sdk');
  return path.join(home, 'Android', 'Sdk');
}

// Which API level to install is a property of the project, not of the machine, so
// it is read from the build file rather than pinned here. Two syntaxes are
// accepted because AGP changed it: the block form `compileSdk { version =
// release(36) }` is what this project uses, and the classic scalar `compileSdk =
// 36` is what most others still use. Matching only one of them fails silently --
// it yields no packages rather than an error -- which is why both are handled.
function androidCompileSdk(rootDir) {
  const androidDir = path.join(rootDir, getPlatformDir(rootDir, 'android'));
  for (const name of ['build.gradle.kts', 'build.gradle']) {
    const file = path.join(androidDir, 'app', name);
    if (!fs.existsSync(file)) continue;
    const text = fs.readFileSync(file, 'utf-8');
    const match = text.match(/compileSdk\s*\{[^}]*release\((\d+)\)/) || text.match(/compileSdk(?:Version)?\s*=?\s*(\d+)/);
    if (match) return { level: parseInt(match[1], 10), file };
    return { level: null, file };
  }
  return { level: null, file: path.join(androidDir, 'app', 'build.gradle.kts') };
}

// Java .properties treats a backslash as an escape, so a raw Windows path would
// be read with its separators eaten.
function toPropertiesPath(value) {
  return value.replace(/\\/g, '\\\\');
}

// Gradle finds the SDK through ANDROID_HOME or through sdk.dir here. The env var
// is not ours to set -- a child process cannot alter the parent shell -- so the
// file is the only channel that works within this run. An existing sdk.dir is
// never rewritten: it is per-machine, gitignored, and the user may well be
// pointing it somewhere deliberately.
function writeLocalProperties(androidDir, sdkHome) {
  const file = path.join(androidDir, 'local.properties');
  const line = `sdk.dir=${toPropertiesPath(sdkHome)}`;

  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, `${line}${os.EOL}`);
    return file;
  }

  const text = fs.readFileSync(file, 'utf-8');
  if (/^\s*sdk\.dir\s*=/m.test(text)) return null;
  fs.appendFileSync(file, `${text.endsWith('\n') ? '' : os.EOL}${line}${os.EOL}`);
  return file;
}

// Deliberately *not* a TOOL_SPECS entry, and deliberately not called from
// ensureToolchain. Everything in there is a host-global tool probed by version;
// SDK packages are project-scoped, their versions come out of build.gradle.kts,
// and the result is written into the project's own local.properties. Folding them
// in would also put them behind ensureToolchain's early return, which fires
// precisely when the host already has the CLI -- i.e. for the users most likely
// to be missing SDK packages.
function ensureAndroidSdk(rootDir) {
  const { level, file } = androidCompileSdk(rootDir);
  if (!level) {
    console.log(`\n${t('android-sdk-no-compilesdk', { file: path.relative(rootDir, file) })}`);
    return;
  }

  const bin = androidCliBinary();
  if (!bin) {
    console.log(`\n${t('android-sdk-cli-missing')}`);
    return;
  }

  // Paired with compileSdk because the project declares no buildToolsVersion, so
  // AGP's default is the only other candidate and it is not readable from here.
  const packages = [`platforms/android-${level}`, `build-tools/${level}.0.0`, 'platform-tools'];
  const sdkHome = androidSdkHome();

  console.log(`\n${t('android-sdk-installing', { list: packages.join(' ') })}`);

  // The path is passed explicitly instead of reading it back out of `android
  // info`, so the value written to local.properties is known rather than parsed
  // out of human-readable output whose shape is not a contract. `--sdk` is a
  // global flag and must precede the subcommand.
  fs.mkdirSync(sdkHome, { recursive: true });
  if (!run(`"${bin}" --sdk="${sdkHome}" sdk install ${packages.join(' ')}`, rootDir)) {
    console.log(`   ${t('android-sdk-install-failed')}`);
    return;
  }

  console.log(`   ${t('android-sdk-ready', { dir: sdkHome })}`);

  const androidDir = path.join(rootDir, getPlatformDir(rootDir, 'android'));
  const written = writeLocalProperties(androidDir, sdkHome);
  if (written) console.log(`   ${t('android-sdk-local-properties', { file: path.relative(rootDir, written) })}`);
}

// First dotted number in the output, e.g. `Apache Maven 3.9.6 (abc)` -> `3.9.6`.
function extractVersion(output) {
  const match = String(output).match(/\d+(?:\.\d+)*/);
  return match ? match[0] : null;
}

// Component-wise so that 1.10.0 sorts above 1.9.0, which a string compare gets
// wrong. Returns true when `version` is below `floor`.
function isOlder(version, floor) {
  const a = version.split('.').map(n => parseInt(n, 10) || 0);
  const b = floor.split('.').map(n => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const ai = a[i] || 0;
    const bi = b[i] || 0;
    if (ai < bi) return true;
    if (ai > bi) return false;
  }
  return false;
}

function probeTool(name) {
  const spec = TOOL_SPECS[name];
  let output = '';
  try {
    output = execSync(spec.probe, { stdio: 'pipe', shell: true, encoding: 'utf-8' });
  } catch (e) {
    // A non-zero exit still often carries a usable version string, so salvage it
    // rather than treating every failure as "missing".
    output = `${(e && e.stdout) || ''}${(e && e.stderr) || ''}`;
  }
  const version = extractVersion(output);
  if (!version) return { name, spec, status: 'miss' };
  if (spec.floor && isOlder(version, spec.floor)) return { name, spec, status: 'old', version };
  return { name, spec, status: 'ok', version };
}

// Union of the toolchains the given platforms need, deduplicated because api and
// android both want a JDK. Callers pass an already host-filtered list, so a
// Windows checkout with ios enabled never reports findings it cannot act on.
function requiredTools(platforms) {
  const tools = new Set();
  for (const p of platforms) {
    for (const tool of PLATFORM_TOOLCHAIN[p.name] || []) {
      tools.add(tool);
    }
  }
  return [...tools];
}

function hasMise() {
  try {
    execSync('mise --version', { stdio: 'pipe', shell: true });
    return true;
  } catch {
    return false;
  }
}

// Installs only what the probes actually found missing or outdated. This is the
// whole point of doing it here rather than up front: a web-only project never
// triggers a JDK download, which is the largest install in the matrix.
function ensureToolchain(platforms, apiInDocker, installEnv = {}) {
  const tools = requiredTools(platforms);
  if (tools.length === 0) {
    console.log(`\n${t('toolchain-none')}`);
    return;
  }

  // Name the active profile only when it actually changes anything, so a
  // default run stays quiet instead of announcing that nothing is different.
  const registryProfile = Object.keys(installEnv).length > 0
    ? Object.keys(REGISTRY_PROFILES).find(name => REGISTRY_PROFILES[name] === installEnv)
    : null;
  if (registryProfile) console.log(`\n${t('toolchain-registry', { profile: registryProfile })}`);

  console.log(`\n${t('toolchain-scope', { list: toolLabels(tools).join(', ') })}`);
  console.log(`   ${t('toolchain-derived', { list: platforms.map(p => p.label).join(', ') })}`);

  const results = tools.map(probeTool);
  for (const r of results) {
    if (r.status === 'ok') console.log(`   ${t('toolchain-ok', { label: r.spec.label, version: r.version })}`);
    else if (r.status === 'old') console.log(`   ${t('toolchain-old', { label: r.spec.label, version: r.version, floor: r.spec.floor })}`);
    else console.log(`   ${t('toolchain-miss', { label: r.spec.label })}`);
  }

  let pending = results.filter(r => r.status !== 'ok');

  // An API that runs in a container needs no JDK or Maven on the host. But a
  // reachable Docker does not prove that is the arrangement: the documented
  // default runs only MySQL and Redis in Docker and the API itself on the host,
  // so installing Docker for the database must not cost the host its JDK. The
  // user therefore has to say so with `--docker`.
  //
  // Scoped to tools the API is the *only* claimant of, because Android drives
  // Gradle on the host: in an api+android project even an explicit --docker says
  // nothing about whether Gradle can find a JDK.
  const claimedElsewhere = new Set(requiredTools(platforms.filter(p => p.name !== 'api')));
  const dockerCovers = r => (r.name === 'java' || r.name === 'maven') && !claimedElsewhere.has(r.name);
  if (apiInDocker && pending.some(dockerCovers)) {
    // Name what was actually skipped: in an api+android project this is Maven
    // only, and claiming the JDK was skipped too would contradict the install
    // that follows.
    const skipped = pending.filter(dockerCovers).map(r => r.spec.label).join(', ');
    console.log(`\n${t('toolchain-api-docker', { list: skipped })}`);
    pending = pending.filter(r => !dockerCovers(r));
  }

  if (pending.length === 0) {
    console.log(`\n${t('toolchain-ready')}`);
    return;
  }

  // Docker is reported but never installed here, so split it out before deciding
  // whether mise is needed at all.
  // Three outcomes, not two. `pin` and `install` are separate fields precisely so
  // that a missing `pin` no longer implies "cannot be installed": Docker still
  // falls through to `manual`, but a tool carrying its own installer does not.
  const selfInstall = pending.filter(r => r.spec.install);
  const viaMise = pending.filter(r => r.spec.pin);
  const manual = pending.filter(r => !r.spec.pin && !r.spec.install);

  for (const r of manual) {
    console.log(`\n${t('toolchain-manual', { label: r.spec.label })}`);
  }

  let installedAny = false;

  for (const r of selfInstall) {
    console.log(`\n${t('toolchain-installing-official', { label: r.spec.label })}`);
    if (r.spec.install()) installedAny = true;
    else console.log(`   ${t('toolchain-install-failed', { label: r.spec.label })}`);
  }

  // Attached to the install, not to the probe: a host that already has the CLI
  // has already been told. But an install that finishes without this line would
  // report a capability Windows does not actually have.
  if (process.platform === 'win32' && selfInstall.some(r => r.name === 'android-cli')) {
    console.log(`   ${t('android-cli-windows-emulator')}`);
  }

  if (viaMise.length > 0) {
    if (!hasMise()) {
      console.log(`\n${t('toolchain-mise-missing', { list: viaMise.map(r => r.spec.label).join(', ') })}`);
    } else {
      for (const r of viaMise) {
        console.log(`\n${t('toolchain-installing', { label: r.spec.label, pin: r.spec.pin })}`);
        if (run(`mise use --global ${r.spec.pin}`, process.cwd(), 'inherit', installEnv)) installedAny = true;
        else console.log(`   ${t('toolchain-install-failed', { label: r.spec.label })}`);
      }
    }
  }

  if (installedAny) console.log(`\n${t('toolchain-installed')}`);
}

function initCommand(args = []) {
  const rootDir = findProjectRoot();
  if (!rootDir) {
    console.error('\n❌ Error: Not in a Marsquakes project.');
    process.exit(1);
  }

  // Opt-in, not detected: see the note in ensureToolchain about why a working
  // Docker is not evidence that the API runs inside it.
  const apiInDocker = args.includes('--docker');

  // Registry profile for the tool installers only. Default when the flag is
  // absent; an unknown value is a loud error rather than a silent fallback,
  // because `--registry cnn` (a typo) would otherwise download from upstream
  // while the user believes they are on a mirror.
  const registryIndex = args.indexOf('--registry');
  let registryName = 'default';
  if (registryIndex > -1) {
    registryName = args[registryIndex + 1];
    if (!registryName || !Object.prototype.hasOwnProperty.call(REGISTRY_PROFILES, registryName)) {
      console.error(`\n❌ ${t('registry-unknown', { profile: registryName })}`);
      process.exit(1);
    }
  }
  const installEnv = REGISTRY_PROFILES[registryName];

  const config = loadPlatformsConfig(rootDir);
  const enabledPlatforms = filterPlatformsByHost(getEnabledPlatforms(config), 'all');

  console.log(`\n📦 Initializing Marsquakes project...\n`);

  try {
    execSync('pnpm --version', { stdio: 'pipe' });
    console.log('✅ pnpm');
  } catch {
    console.error(t('pnpm-not-installed'));
    process.exit(1);
  }

  console.log('\n📦 Installing workspace dependencies...');
  run('pnpm install', rootDir);

  if (enabledPlatforms.some(p => p.name === 'android')) {
    const androidDir = path.join(rootDir, 'apps', 'android');
    if (fs.existsSync(path.join(androidDir, 'gradlew'))) {
      console.log('\n📱 Checking Android Gradle wrapper...');
      run(gradlew('--version'), androidDir);
    }
  }

  ensureToolchain(enabledPlatforms, apiInDocker, installEnv);

  // After ensureToolchain, not inside it: the SDK is installed *by* the Android
  // CLI, so it can only be attempted once that install has had its chance.
  if (enabledPlatforms.some(p => p.name === 'android')) {
    ensureAndroidSdk(rootDir);
  }

  console.log('\n✅ Initialization complete!\n');
}

function cleanCommand() {
  const rootDir = findProjectRoot();
  if (!rootDir) {
    console.error('\n❌ Error: Not in a Marsquakes project.');
    process.exit(1);
  }

  console.log('\n🧹 Cleaning build artifacts...\n');
  run('turbo clean', rootDir);
  console.log('\n✅ Clean complete!\n');
}

async function updateCommand(args) {
  const rootDir = findProjectRoot();
  if (!rootDir) {
    console.error('\n❌ Error: Not in a Marsquakes project.');
    process.exit(1);
  }

  const templateUrl = args.find((_, i) => args[i - 1] === '--template') || DEFAULT_TEMPLATE;
  
  console.log(`\n🔄 Updating Marsquakes project...\n`);
  console.log(`   Current project: ${rootDir}`);
  console.log(`   Template: ${templateUrl}`);

  const tempDir = path.join(require('os').tmpdir(), `marsquakes-update-${Date.now()}`);
  const backupDir = path.join(rootDir, '.mars-update-backup');

  try {
    console.log('\n📥 Fetching latest template...');
    try {
      execSync(`git clone --depth 1 ${templateUrl} "${tempDir}"`, { stdio: 'pipe' });
    } catch (e) {
      console.error('\n❌ Failed to fetch template.');
      console.log('   Trying local template...');
      if (fs.existsSync(templateUrl)) {
        copyDir(templateUrl, tempDir);
      } else {
        console.error(`\n❌ Template not found: ${templateUrl}`);
        process.exit(1);
      }
    }

    console.log('\n📁 Backing up current project...');
    if (fs.existsSync(backupDir)) {
      fs.rmSync(backupDir, { recursive: true, force: true });
    }
    copyDir(rootDir, backupDir);

    const filesToUpdate = [
      'AGENTS.md',
      'turbo.json',
      'pnpm-workspace.yaml',
      'platforms.json',
      'package.json',
      'scripts/',
      'packages/',
    ];

    const skippedFiles = [
      '.git',
      'node_modules',
      '.gradle',
      'build',
      'dist',
      '.turbo',
      '.idea',
      'apps/',
      'docs/',
      '.docs/',
      'design/',
      '.mars-update-backup',
    ];

    console.log('\n🔄 Applying updates...');
    const changes = [];

    for (const file of filesToUpdate) {
      const srcPath = path.join(tempDir, file);
      const destPath = path.join(rootDir, file);

      if (!fs.existsSync(srcPath)) continue;

      if (fs.statSync(srcPath).isDirectory()) {
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
          changes.push({ type: 'added', path: file });
        }
        copyDirRecursive(srcPath, destPath, skippedFiles, changes);
      } else {
        const srcContent = fs.readFileSync(srcPath, 'utf-8');
        
        if (fs.existsSync(destPath)) {
          const destContent = fs.readFileSync(destPath, 'utf-8');
          if (srcContent !== destContent) {
            fs.writeFileSync(destPath, srcContent);
            changes.push({ type: 'updated', path: file });
          }
        } else {
          fs.writeFileSync(destPath, srcContent);
          changes.push({ type: 'added', path: file });
        }
      }
    }

    if (changes.length === 0) {
      console.log('\n✅ No updates available.');
    } else {
      console.log('\n📋 Changes made:');
      changes.forEach(c => {
        const icon = c.type === 'added' ? '+' : '~';
        console.log(`   ${icon} ${c.path}`);
      });

      console.log('\n📦 Updating dependencies...');
      run('pnpm install', rootDir);
    }

    console.log('\n✅ Update complete!');
    console.log('\n📝 Note: Your apps/, docs/ and .docs/ directories were preserved.');
    console.log(`   A backup was saved to: ${backupDir}`);

  } catch (e) {
    console.error(`\n❌ Update failed: ${e.message}`);
    console.log('\n🔄 Restoring from backup...');
    if (fs.existsSync(backupDir)) {
      fs.rmSync(rootDir, { recursive: true, force: true });
      fs.renameSync(backupDir, rootDir);
    }
    process.exit(1);
  } finally {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }
}

function copyDirRecursive(src, dest, skip, changes) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    if (skip.includes(entry.name)) continue;

    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    const relPath = destPath.replace(dest.split('apps')[0], '');

    if (entry.isDirectory()) {
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
        changes.push({ type: 'added', path: relPath });
      }
      copyDirRecursive(srcPath, destPath, skip, changes);
    } else {
      const srcContent = fs.readFileSync(srcPath, 'utf-8');
      
      if (fs.existsSync(destPath)) {
        const destContent = fs.readFileSync(destPath, 'utf-8');
        if (srcContent !== destContent) {
          fs.writeFileSync(destPath, srcContent);
          changes.push({ type: 'updated', path: relPath });
        }
      } else {
        fs.writeFileSync(destPath, srcContent);
        changes.push({ type: 'added', path: relPath });
      }
    }
  }
}

function main() {
  const args = process.argv.slice(2);
  parseLangArg(args);

  if (args.length === 0 || args.includes('--help')) {
    showUsage();
    process.exit(args.includes('--help') ? 0 : 1);
  }

  if (args.includes('--version') || args.includes('-v') || args.includes('-V')) {
    console.log(pkg.version);
    process.exit(0);
  }

  const command = args[0];
  const commandArgs = args.slice(1);

  switch (command) {
    case 'create':
      createProject(commandArgs);
      break;
    case 'update':
      updateCommand(commandArgs);
      break;
    case 'dev':
      devCommand(commandArgs);
      break;
    case 'build':
      buildCommand(commandArgs);
      break;
    case 'init':
      initCommand(commandArgs);
      break;
    case 'clean':
      cleanCommand();
      break;
    default:
      console.error(`\n❌ Unknown command: "${command}"`);
      showUsage();
      process.exit(1);
  }
}

main();
