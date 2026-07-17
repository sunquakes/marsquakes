const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const PROJECT_ROOT = path.resolve(__dirname, '..');

function run(command, cwd = PROJECT_ROOT, options = {}) {
  console.log(`\n> ${command}`);
  try {
    execSync(command, { cwd, stdio: 'inherit', ...options });
    return true;
  } catch (e) {
    return false;
  }
}

function check(command) {
  try {
    execSync(command, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function step(title) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`  ${title}`);
  console.log(`${'='.repeat(50)}`);
}

// ============================================
step('1. 环境检查');
// ============================================

const nodeVersion = process.version;
console.log(`Node.js: ${nodeVersion}`);

if (!check('pnpm --version')) {
  console.error('❌ pnpm 未安装，请先安装 pnpm: npm install -g pnpm');
  process.exit(1);
}
console.log('✅ pnpm 已安装');

// ============================================
step('2. 安装 Monorepo 依赖');
// ============================================

if (run('pnpm install', PROJECT_ROOT)) {
  console.log('✅ pnpm workspace 依赖安装完成');
} else {
  console.error('❌ 依赖安装失败');
}

// ============================================
step('3. 初始化 Android 端');
// ============================================

const androidDir = path.join(PROJECT_ROOT, 'apps', 'android');
if (fs.existsSync(path.join(androidDir, 'gradlew'))) {
  if (run('.\\gradlew --version', androidDir)) {
    console.log('✅ Android Gradle 环境正常');
  } else {
    console.error('❌ Android Gradle 初始化失败，请检查 JDK 11+ 和 Android SDK');
  }
} else {
  console.log('⚠️ 未找到 apps/android/gradlew，跳过 Android 端');
}

// ============================================
step('4. 其他平台状态');
// ============================================

const platforms = [
  { name: 'iOS', dir: 'apps/ios', tip: '请使用 Xcode 打开 apps/ios/ 目录' },
  { name: 'API', dir: 'apps/api', tip: 'apps/api/ 目录待初始化' },
  { name: 'Windows', dir: 'apps/windows', tip: 'apps/windows/ 目录待初始化' },
  { name: 'Linux', dir: 'apps/linux', tip: 'apps/linux/ 目录待初始化' },
  { name: 'macOS', dir: 'apps/macos', tip: 'apps/macos/ 目录待初始化' },
];

for (const p of platforms) {
  const dir = path.join(PROJECT_ROOT, p.dir);
  const exists = fs.existsSync(dir) && fs.readdirSync(dir).length > 0;
  console.log(`${exists ? '✅' : '⏳'} ${p.name}: ${p.tip}`);
}

// ============================================
step('初始化完成');
// ============================================

console.log('\n常用命令:');
console.log('  pnpm dev             - Turborepo 启动所有 dev');
console.log('  pnpm dev --filter=web- 仅启动 Web 开发服务器');
console.log('  pnpm build           - Turborepo 构建全部');
console.log('  npm run dev:android  - 安装 Android Debug 包');
console.log('  npm run build:android- 构建 Android Release 包');
console.log('');