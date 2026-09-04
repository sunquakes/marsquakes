#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync, spawn } = require('child_process');

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

function run(command, cwd, stdio = 'inherit') {
  console.log(`\n> ${command}`);
  try {
    execSync(command, { cwd, stdio, shell: true });
    return true;
  } catch (e) {
    return false;
  }
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
        if (p.description) {
          const descPrefix = isCursor && !isDisabled ? '      ' : '         ';
          console.log(`${descPrefix}${p.description}`);
        }
      });
    }
    
    const selectedCount = selected.filter(p => p.selected).length;
    console.log(`\n  ${t('current-selection', { count: selectedCount })}`);
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
  console.log('  pnpm install');
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

function initCommand() {
  const rootDir = findProjectRoot();
  if (!rootDir) {
    console.error('\n❌ Error: Not in a Marsquakes project.');
    process.exit(1);
  }

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

  const androidDir = path.join(rootDir, 'apps', 'android');
  if (fs.existsSync(path.join(androidDir, 'gradlew'))) {
    console.log('\n📱 Checking Android Gradle...');
    run('.\\gradlew --version', androidDir);
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
      initCommand();
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
