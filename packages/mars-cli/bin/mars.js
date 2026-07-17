#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync, spawn } = require('child_process');

const DEFAULT_TEMPLATE = 'https://github.com/sunquakes/marsquakes.git';

const ALL_PLATFORMS = [
  { name: 'web', category: 'web', label: 'Web 用户端', default: false, description: '面向用户的 Web 前端应用' },
  { name: 'web-admin', category: 'web', label: 'Web 后台管理', default: true, description: '后台管理系统' },
  { name: 'api', category: 'api', label: '后端接口服务', default: true, description: 'RESTful API 服务' },
  { name: 'android', category: 'mobile', label: 'Android 客户端', default: false, description: 'Android 原生应用' },
  { name: 'ios', category: 'mobile', label: 'iOS 客户端', default: false, description: 'iOS 原生应用' },
  { name: 'windows', category: 'desktop', label: 'Windows 桌面端', default: false, description: 'Windows 桌面应用' },
  { name: 'linux', category: 'desktop', label: 'Linux 桌面端', default: false, description: 'Linux 桌面应用' },
  { name: 'macos', category: 'desktop', label: 'macOS 桌面端', default: false, description: 'macOS 桌面应用' },
];

function showUsage() {
  console.log(`
Usage: mars <command> [options]

Commands:
  create <project-name>    Create a new project from template
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
  --help                   Show this help message

Examples:
  mars create my-project              # Interactive mode (default)
  mars create my-project -n           # Non-interactive mode (default platforms)
  mars create my-project --from ./path/to/template
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

function getEnabledPlatforms(config) {
  if (!config || !config.platforms) return [];
  const platforms = [];
  for (const [category, group] of Object.entries(config.platforms)) {
    for (const [name, info] of Object.entries(group)) {
      if (info.enabled) {
        platforms.push({ name, ...info });
      }
    }
  }
  return platforms;
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
    ['- **项目名称**: Marsquakes', `- **项目名称**: ${projectName}`],
    ['Marsquakes/', `${projectName}/`],
    ['Marsquakes - 多平台项目', `${projectName} - 多平台项目`],
  ];

  const filesToReplace = [
    'package.json',
    'platforms.json',
    'AGENTS.md',
    'apps/android/AGENTS.md',
    'apps/web/AGENTS.md',
    'apps/web-admin/AGENTS.md',
    'apps/ios/AGENTS.md',
    'apps/api/AGENTS.md',
    'apps/windows/AGENTS.md',
    'apps/linux/AGENTS.md',
    'apps/macos/AGENTS.md',
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

async function selectPlatforms() {
  const selected = ALL_PLATFORMS.map(p => ({ ...p, selected: p.default }));
  
  const hasTTY = process.stdout.isTTY && process.stdin.isTTY;
  
  if (hasTTY) {
    return selectPlatformsInteractive(selected);
  } else {
    return selectPlatformsSimple(selected);
  }
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
    console.log('\n📋 请选择需要创建的平台模块\n');
    console.log('   操作提示: 上下键移动 | 空格键切换选择 | 回车确认\n');
    
    const categoryGroups = {};
    selected.forEach(p => {
      if (!categoryGroups[p.category]) {
        categoryGroups[p.category] = [];
      }
      categoryGroups[p.category].push(p);
    });
    
    const categoryLabels = {
      web: '🌐 Web',
      api: '⚙️  API',
      mobile: '📱 移动端',
      desktop: '🖥️ 桌面端',
    };
    
    for (const [category, platforms] of Object.entries(categoryGroups)) {
      console.log(`\n  ${categoryLabels[category]}:`);
      platforms.forEach((p, idx) => {
        const globalIdx = selected.findIndex(s => s.name === p.name);
        const isCursor = globalIdx === cursor;
        const checkbox = p.selected ? '[✓]' : '[ ]';
        const prefix = isCursor ? ' → ' : '   ';
        console.log(`${prefix}${checkbox} ${p.label}`);
        if (isCursor) {
          console.log(`      ${p.description}`);
        }
      });
    }
    
    const selectedCount = selected.filter(p => p.selected).length;
    console.log(`\n  当前已选择 ${selectedCount} 个模块`);
  };
  
  const cleanup = () => {
    rl.close();
    process.stdin.removeListener('keypress', handleKeypress);
  };
  
  const handleKeypress = (_, key) => {
    if (!key) return;
    
    if (key.name === 'up') {
      cursor = Math.max(0, cursor - 1);
      render();
    } else if (key.name === 'down') {
      cursor = Math.min(selected.length - 1, cursor + 1);
      render();
    } else if (key.name === 'space') {
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
    if (resolveFn) {
      resolveFn(selected.filter(p => p.selected));
    }
  });
  
  process.stdin.on('keypress', handleKeypress);
  
  return new Promise(resolve => {
    resolveFn = resolve;
    render();
  });
}

async function selectPlatformsSimple(selected) {
  console.log('\n📋 请选择需要创建的平台模块\n');
  
  const categoryGroups = {};
  selected.forEach(p => {
    if (!categoryGroups[p.category]) {
      categoryGroups[p.category] = [];
    }
    categoryGroups[p.category].push(p);
  });
  
  const categoryLabels = {
    web: '🌐 Web',
    api: '⚙️  API',
    mobile: '📱 移动端',
    desktop: '🖥️ 桌面端',
  };
  
  let index = 1;
  const indexMap = [];
  
  for (const [category, platforms] of Object.entries(categoryGroups)) {
    console.log(`\n  ${categoryLabels[category]}:`);
    platforms.forEach(p => {
      const checkbox = p.selected ? '[✓]' : '[ ]';
      console.log(`   ${index}. ${checkbox} ${p.label}`);
      indexMap.push({ index, platform: p });
      index++;
    });
  }
  
  console.log('\n  操作提示:');
  console.log('   - 输入数字切换选中状态（如：1 2 3）');
  console.log('   - 输入 a 全选');
  console.log('   - 输入 n 取消全选');
  console.log('   - 直接回车使用默认配置');
  
  const answer = await prompt('\n  请输入选择（多个数字用空格分隔）: ');
  
  if (!answer.trim()) {
    return selected.filter(p => p.selected);
  }
  
  const inputs = answer.trim().toLowerCase().split(/\s+/);
  
  for (const input of inputs) {
    if (input === 'a') {
      selected.forEach(p => p.selected = true);
    } else if (input === 'n') {
      selected.forEach(p => p.selected = false);
    } else {
      const num = parseInt(input, 10);
      if (!isNaN(num)) {
        const item = indexMap.find(i => i.index === num);
        if (item) {
          const p = selected.find(s => s.name === item.platform.name);
          if (p) {
            p.selected = !p.selected;
          }
        }
      }
    }
  }
  
  console.log(`\n✅ 已选择 ${selected.filter(p => p.selected).length} 个模块:`);
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
    }
  }
  
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
}

function removeUnselectedPlatforms(targetDir, selectedPlatforms) {
  const selectedNames = new Set(selectedPlatforms.map(p => p.name));
  
  ALL_PLATFORMS.forEach(p => {
    if (!selectedNames.has(p.name)) {
      const platformDir = path.join(targetDir, 'apps', p.name);
      if (fs.existsSync(platformDir)) {
        fs.rmSync(platformDir, { recursive: true, force: true });
        console.log(`   ✅ 已移除: ${p.label}`);
      }
    }
  });
}

async function createProject(args) {
  const { projectName, templateUrl, fromPath, interactive } = parseCreateArgs(args);
  const targetDir = path.resolve(process.cwd(), projectName);

  if (fs.existsSync(targetDir)) {
    console.error(`\n❌ Error: Directory "${projectName}" already exists.`);
    process.exit(1);
  }

  console.log(`\n📦 Creating project "${projectName}"...\n`);

  if (fromPath) {
    const templateDir = path.resolve(fromPath);
    if (!fs.existsSync(templateDir)) {
      console.error(`\n❌ Error: Template directory "${fromPath}" does not exist.`);
      process.exit(1);
    }
    console.log(`📁 Copying from local template: ${templateDir}`);
    const exclude = new Set(['.git', 'node_modules', '.gradle', 'build', 'dist', '.turbo', '.idea', projectName]);
    copyDir(templateDir, targetDir, exclude);
  } else if (templateUrl) {
    console.log(`🌐 Cloning template from: ${templateUrl}`);
    try {
      execSync(`git clone --depth 1 ${templateUrl} "${projectName}"`, { stdio: 'inherit' });
    } catch (e) {
      console.error('\n❌ Failed to clone template. Please check the URL or your network connection.');
      process.exit(1);
    }
  } else {
    const currentDir = process.cwd();
    const isMarsquakesProject = ['package.json', 'AGENTS.md', 'turbo.json'].every(file => 
      fs.existsSync(path.join(currentDir, file))
    );
    
    if (isMarsquakesProject) {
      console.log(`📁 Copying from current directory: ${currentDir}`);
      const exclude = new Set(['.git', 'node_modules', '.gradle', 'build', 'dist', '.turbo', '.idea', projectName]);
      copyDir(currentDir, targetDir, exclude);
    } else {
      console.log(`🌐 Cloning template from: ${DEFAULT_TEMPLATE}`);
      try {
        execSync(`git clone --depth 1 ${DEFAULT_TEMPLATE} "${projectName}"`, { stdio: 'inherit' });
      } catch (e) {
        console.error('\n❌ Failed to clone template. Please check the URL or your network connection.');
        process.exit(1);
      }
    }
  }

  let selectedPlatforms = ALL_PLATFORMS.filter(p => p.default);
  
  if (interactive) {
    console.log('\n🔧 进入交互式平台选择模式...');
    selectedPlatforms = await selectPlatforms();
    console.log(`\n✅ 已选择 ${selectedPlatforms.length} 个模块:`);
    selectedPlatforms.forEach(p => console.log(`   - ${p.label}`));
  } else {
    console.log('\n🔧 使用默认模块配置...');
    console.log(`   已选择 ${selectedPlatforms.length} 个模块: ${selectedPlatforms.map(p => p.label).join(', ')}`);
    console.log('   使用 -n / --non-interactive 参数跳过交互模式');
  }

  console.log('\n🔧 更新平台配置...');
  updatePlatformsConfig(targetDir, selectedPlatforms);
  
  console.log('\n🔧 清理未选择的平台目录...');
  removeUnselectedPlatforms(targetDir, selectedPlatforms);

  console.log('\n🔧 Customizing project name...');
  replaceProjectName(targetDir, projectName);

  const gitDir = path.join(targetDir, '.git');
  if (fs.existsSync(gitDir)) {
    fs.rmSync(gitDir, { recursive: true, force: true });
  }
  console.log('\n🔨 Initializing git repository...');
  try {
    execSync('git init', { cwd: targetDir, stdio: 'pipe' });
    execSync('git config user.email "admin@example.com"', { cwd: targetDir, stdio: 'pipe' });
    execSync('git config user.name "Admin"', { cwd: targetDir, stdio: 'pipe' });
    execSync('git add .', { cwd: targetDir, stdio: 'pipe' });
    execSync('git commit -m "init: create project from template"', { cwd: targetDir, stdio: 'pipe' });
  } catch (e) {
    console.warn('\n⚠️  Git initialization skipped (non-fatal). You can manually run git init later.');
  }

  console.log(`\n✅ Project "${projectName}" created successfully!\n`);
  console.log('Selected platforms:');
  selectedPlatforms.forEach(p => console.log(`   ✓ ${p.label}`));
  console.log('');
  console.log('Next steps:');
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

function runDocker(rootDir, platform, mode) {
  if (!checkDocker()) {
    console.error('\n❌ Docker is not installed or not running.');
    console.log('   Please install Docker: https://docs.docker.com/get-docker/');
    process.exit(1);
  }

  const targetPlatform = platform === 'all' ? 'web' : platform;

  const dockerfileDir = path.join(rootDir, 'docker', targetPlatform);
  const dockerfile = path.join(dockerfileDir, mode === 'build' ? 'Dockerfile.build' : 'Dockerfile');

  if (!fs.existsSync(dockerfile)) {
    console.error(`\n❌ Dockerfile not found for platform "${targetPlatform}" (mode: ${mode})`);
    console.log(`   Expected: ${dockerfile}`);
    process.exit(1);
  }

  const imageName = `marsquakes/${targetPlatform}:${mode}`;
  const containerName = `marsquakes-${targetPlatform}-${mode}`;

  console.log(`\n🐳 Building Docker image: ${imageName}`);
  console.log(`   Dockerfile: ${dockerfile}`);
  try {
    execSync(`docker build -f "${dockerfile}" -t ${imageName} "${rootDir}"`, { stdio: 'inherit' });
  } catch (e) {
    console.error('\n❌ Docker build failed.');
    process.exit(1);
  }

  console.log(`\n🚀 Running Docker container: ${containerName}`);

  const dockerArgs = ['run', '--rm', '--name', containerName];

  if (mode === 'dev') {
    dockerArgs.push('-it');
    dockerArgs.push('-v', `${rootDir}:/app`);

    if (targetPlatform === 'web') {
      dockerArgs.push('-p', '3100:3100');
    }
  } else {
    dockerArgs.push('-v', `${rootDir}:/app`);
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
  const enabledPlatforms = getEnabledPlatforms(config);
  const npmPlatforms = enabledPlatforms.filter(p => !['android', 'ios', 'windows', 'linux', 'macos'].includes(p.name));
  const nativePlatforms = enabledPlatforms.filter(p => ['android', 'ios', 'windows', 'linux', 'macos'].includes(p.name));

  if (useDocker) {
    runDocker(rootDir, platform, 'dev');
    return;
  }

  console.log(`\n🚀 Starting development servers...\n`);

  const children = [];

  const npmTargets = platform === 'all'
    ? npmPlatforms.map(p => p.name)
    : (npmPlatforms.some(p => p.name === platform) ? [platform] : []);

  if (npmTargets.length > 0) {
    for (const target of npmTargets) {
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
      console.log(`⏳ ${target.name}: ${target.description} (待初始化)`);
      continue;
    }
    const targetDir = path.join(rootDir, target.dir);
    if (fs.existsSync(path.join(targetDir, platformCmd.script.split(' ')[0]))) {
      const child = spawnProcess(platformCmd.script, [], targetDir);
      children.push(child);
    } else {
      console.log(`⏳ ${target.name}: ${target.description} (目录未就绪)`);
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
  const enabledPlatforms = getEnabledPlatforms(config);

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

  if (platform === 'all' || platform === 'android') {
    if (enabledPlatforms.some(p => p.name === 'android')) {
      const androidDir = path.join(rootDir, 'apps', 'android');
      if (fs.existsSync(path.join(androidDir, 'gradlew'))) {
        run('.\\gradlew assembleRelease', androidDir);
      }
    }
  }

  for (const p of enabledPlatforms) {
    if (['web', 'web-admin', 'android'].includes(p.name)) continue;
    if (platform !== 'all' && platform !== p.name) continue;
    console.log(`⏳ ${p.name}: ${p.description} (待支持)`);
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
    console.error('❌ pnpm 未安装，请先安装: npm install -g pnpm');
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

function main() {
  const args = process.argv.slice(2);

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
