const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// Starts the Docusaurus dev server from any working directory, so the docs can
// be launched with `node scripts/dev-docs.js` (or `pnpm dev:docs`) without
// remembering the `-C docs` invocation. It also makes the "did I install yet?"
// question answerable by the script instead of the reader: on a fresh checkout
// `docs/node_modules` does not exist and `docusaurus start` fails with a
// binary-not-found error that says nothing about how to fix it.
const PROJECT_ROOT = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(PROJECT_ROOT, 'docs');

// pnpm is the only supported package manager (see the root AGENTS.md). Resolve
// it as `pnpm.cmd` on Windows; a plain 'pnpm' is not on CreateProcess's search
// path there and spawns ENOENT.
const PNPMP = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';

function run(args, cwd) {
  return spawnSync(PNPMP, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
}

if (!fs.existsSync(path.join(DOCS_DIR, 'node_modules'))) {
  console.log('[dev-docs] docs dependencies not found — running `pnpm install` in docs/\n');
  const install = run(['install'], DOCS_DIR);
  if (install.status !== 0) {
    process.exit(install.status ?? 1);
  }
}

// `dev` packs the skill archive first and then runs `docusaurus start`, which
// serves with live reload and prints the local URL. Inheriting stdio keeps
// Ctrl+C working so the server stops the same way a direct invocation would.
const dev = run(['run', 'dev'], DOCS_DIR);
process.exit(dev.status ?? 0);
