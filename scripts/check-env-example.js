const path = require('path');
const fs = require('fs');

const PROJECT_ROOT = path.resolve(__dirname, '..');

// The two templates must stay interchangeable: same keys, same order, same
// values, differing only in where packages are downloaded from. Anything else
// means one variant silently lost a setting the other has.
const OFFICIAL = '.env.example';
const MIRROR = '.env.example.cn';
const SOURCE_KEYS = ['NPM_REGISTRY', 'MAVEN_MIRROR_URL'];

const errors = [];

function ok(message) {
  console.log(`[OK] ${message}`);
}

function fail(message) {
  console.error(`[FAIL] ${message}`);
  errors.push(message);
}

function readTemplate(name) {
  const filePath = path.join(PROJECT_ROOT, name);
  if (!fs.existsSync(filePath)) {
    fail(`${name} not found`);
    return null;
  }
  const raw = fs.readFileSync(filePath);
  const text = raw.toString('utf8');
  return { name, raw, text };
}

// Assignments only; comments and blank lines are free to differ because each
// file explains its own trade-off.
function parseAssignments(text) {
  const entries = [];
  const lines = text.split('\n');
  lines.forEach((line, index) => {
    const match = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(line);
    if (match) {
      entries.push({ key: match[1], value: match[2], line: index + 1 });
    }
  });
  return entries;
}

function checkEncoding(file) {
  if (file.raw.length >= 3 && file.raw[0] === 0xef && file.raw[1] === 0xbb && file.raw[2] === 0xbf) {
    fail(`${file.name} starts with a UTF-8 BOM; docker compose reads the first key name literally`);
    return;
  }
  if (file.text.includes('\r\n')) {
    fail(`${file.name} contains CRLF line endings; keep it LF-only`);
    return;
  }
  ok(`${file.name}: no BOM, LF-only`);
}

function checkKeys(official, mirror) {
  const a = parseAssignments(official.text);
  const b = parseAssignments(mirror.text);

  const keysA = a.map((e) => e.key);
  const keysB = b.map((e) => e.key);

  const missingInMirror = keysA.filter((k) => !keysB.includes(k));
  const missingInOfficial = keysB.filter((k) => !keysA.includes(k));

  for (const key of missingInMirror) {
    fail(`${key} is declared in ${official.name} but missing from ${mirror.name}`);
  }
  for (const key of missingInOfficial) {
    fail(`${key} is declared in ${mirror.name} but missing from ${official.name}`);
  }
  if (missingInMirror.length || missingInOfficial.length) return;

  if (keysA.join(',') !== keysB.join(',')) {
    fail(`the two templates declare the same keys in a different order; keep them aligned so a diff stays readable`);
    return;
  }
  ok(`both templates declare the same ${keysA.length} keys in the same order`);

  const valuesB = new Map(b.map((e) => [e.key, e.value]));
  let drifted = 0;
  for (const entry of a) {
    const other = valuesB.get(entry.key);
    if (SOURCE_KEYS.includes(entry.key)) {
      if (other === entry.value) {
        fail(`${entry.key} is identical in both templates (${entry.value}); the mirror variant then has no reason to exist`);
      }
      continue;
    }
    if (other !== entry.value) {
      drifted += 1;
      fail(`${entry.key} differs: ${official.name} has "${entry.value}", ${mirror.name} has "${other}"`);
    }
  }
  if (!drifted) {
    ok(`all non-source values match; only ${SOURCE_KEYS.join(' and ')} differ`);
  }
}

// mars create copies dotfiles, so an unregistered template ships to generated
// projects with this repository's COMPOSE_PROJECT_NAME still in it.
function checkCliRegistration(names) {
  const cliPath = path.join(PROJECT_ROOT, 'packages', 'mars-cli', 'bin', 'mars.js');
  if (!fs.existsSync(cliPath)) {
    fail('packages/mars-cli/bin/mars.js not found; cannot verify template registration');
    return;
  }
  const cli = fs.readFileSync(cliPath, 'utf8');
  for (const name of names) {
    if (cli.includes(`'${name}'`)) {
      ok(`${name} is registered in mars.js`);
    } else {
      fail(`${name} is missing from filesToReplace in mars.js; mars create would leave COMPOSE_PROJECT_NAME unreplaced`);
    }
  }
}

const official = readTemplate(OFFICIAL);
const mirror = readTemplate(MIRROR);

if (official && mirror) {
  checkEncoding(official);
  checkEncoding(mirror);
  checkKeys(official, mirror);
  checkCliRegistration([OFFICIAL, MIRROR]);
}

console.log('');
if (errors.length) {
  console.error(`${errors.length} problem(s) found in the .env templates.`);
  process.exit(1);
}
console.log('.env templates are consistent.');
