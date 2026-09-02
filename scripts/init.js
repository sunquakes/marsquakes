const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const IS_WINDOWS = process.platform === 'win32';

const errors = [];
const warnings = [];

function run(command, cwd = PROJECT_ROOT, options = {}) {
  console.log(`\n> ${command}`);
  try {
    execSync(command, { cwd, stdio: 'inherit', ...options });
    return true;
  } catch {
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

function ok(message) {
  console.log(`[OK] ${message}`);
}

function warn(message) {
  console.warn(`[WARN] ${message}`);
  warnings.push(message);
}

function fail(message) {
  console.error(`[FAIL] ${message}`);
  errors.push(message);
}

function skip(message) {
  console.log(`[SKIP] ${message}`);
}

function readPlatforms() {
  const configPath = path.join(PROJECT_ROOT, 'platforms.json');
  if (!fs.existsSync(configPath)) {
    warn('platforms.json not found, platform steps will be skipped');
    return [];
  }

  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const list = [];
    for (const group of Object.values(config.platforms || {})) {
      for (const [name, item] of Object.entries(group)) {
        list.push({ name, ...item });
      }
    }
    return list;
  } catch (e) {
    warn(`Failed to parse platforms.json: ${e.message}`);
    return [];
  }
}

const PLATFORMS = readPlatforms();

function isEnabled(name) {
  return PLATFORMS.some((p) => p.name === name && p.enabled);
}

// ============================================
step('1. Environment check');
// ============================================

console.log(`Node.js: ${process.version}`);

const requiredNodeMajor = 18;
const nodeMajor = Number(process.version.replace('v', '').split('.')[0]);
if (Number.isFinite(nodeMajor) && nodeMajor < requiredNodeMajor) {
  fail(`Node.js >= ${requiredNodeMajor} is required, current: ${process.version}`);
  process.exit(1);
}

if (!check('pnpm --version')) {
  fail('pnpm is not installed. Enable it first: corepack enable pnpm');
  process.exit(1);
}
ok('pnpm is installed');

if (check('git --version')) {
  ok('git is installed');
} else {
  warn('git is not installed, version control will be unavailable');
}

// ============================================
step('2. Install monorepo dependencies');
// ============================================

if (run('pnpm install', PROJECT_ROOT)) {
  ok('pnpm workspace dependencies installed');
} else {
  warn('Frozen lockfile install failed, retrying with --no-frozen-lockfile');
  if (run('pnpm install --no-frozen-lockfile', PROJECT_ROOT)) {
    ok('pnpm workspace dependencies installed (lockfile updated)');
  } else {
    fail('Failed to install dependencies');
  }
}

// ============================================
step('3. Initialize Android');
// ============================================

const androidDir = path.join(PROJECT_ROOT, 'apps', 'android');
const gradlewFile = IS_WINDOWS ? 'gradlew.bat' : 'gradlew';

if (!isEnabled('android')) {
  skip('android is disabled in platforms.json');
} else if (!fs.existsSync(path.join(androidDir, gradlewFile))) {
  skip(`apps/android/${gradlewFile} not found, skipping Android`);
} else if (!process.env.JAVA_HOME && !check('java -version')) {
  warn('JAVA_HOME is not set and java was not found, skipping Gradle check');
} else {
  const gradlewCmd = IS_WINDOWS ? '.\\gradlew.bat --version' : './gradlew --version';
  if (run(gradlewCmd, androidDir)) {
    ok('Android Gradle environment is ready');
  } else {
    fail('Android Gradle init failed, check JDK 17+ and Android SDK');
  }
}

// ============================================
step('4. Platform status');
// ============================================

for (const platform of PLATFORMS) {
  if (!platform.enabled) {
    console.log(`[OFF]      ${platform.name.padEnd(10)} disabled in platforms.json`);
    continue;
  }

  const dir = path.join(PROJECT_ROOT, platform.dir || '');
  const initialized = fs.existsSync(dir) && fs.readdirSync(dir).length > 0;
  const label = initialized ? '[READY]  ' : '[PENDING]';
  const detail = initialized
    ? `${platform.dir} (${platform.tech_stack || 'TBD'})`
    : `${platform.dir} pending initialization`;
  console.log(`${label}  ${platform.name.padEnd(10)} ${detail}`);
}

// ============================================
step('Summary');
// ============================================

if (errors.length > 0) {
  console.log(`\n${errors.length} error(s):`);
  errors.forEach((message) => console.log(`  - ${message}`));
}

if (warnings.length > 0) {
  console.log(`\n${warnings.length} warning(s):`);
  warnings.forEach((message) => console.log(`  - ${message}`));
}

if (errors.length === 0) {
  console.log('\nInitialization complete!');
}

console.log('\nCommon commands:');
console.log('  pnpm dev                  Start all dev tasks via Turborepo');
console.log('  pnpm dev --filter=web     Start the web dev server only');
console.log('  pnpm build                Build everything via Turborepo');
console.log('  pnpm clean                Clean build artifacts');
console.log('  pnpm dev:android          Install the Android debug build');
console.log('  pnpm build:android        Build the Android release package');
console.log('');

process.exit(errors.length > 0 ? 1 : 0);
