const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Packages `.agents/skills/marsquakes-setup/` into a zip the documentation site
// can offer as a download, so a reader can install the skill without cloning
// this repository. That standalone use is the whole point of the skill, and it
// is also why this script validates before it compresses: a broken skill still
// zips perfectly well, and the failure would then only surface as the agent
// silently never listing it.
//
// Written with Node built-ins only (no `archiver`, no `jszip`). This runs before
// the docs build on machines that may have just installed Node, and adding a
// dependency to `docs/` for ~150 lines of well-specified format would be a poor
// trade.
const PROJECT_ROOT = path.resolve(__dirname, '..');
const SKILL_NAME = 'marsquakes-setup';
const SKILL_DIR = path.join(PROJECT_ROOT, '.agents', 'skills', SKILL_NAME);
const OUT_DIR = path.join(PROJECT_ROOT, 'docs', 'static', 'skills');
const OUT_FILE = path.join(OUT_DIR, `${SKILL_NAME}.zip`);

// Generated alongside the archive and consumed by the download button. See
// `writeMetadata` at the bottom of this file for why it is a `.ts` module.
const META_FILE = path.join(
  PROJECT_ROOT,
  'docs',
  'src',
  'components',
  'SkillDownload',
  'archive.ts',
);

// The public path of the archive, relative to the site's `baseUrl`. Kept here
// because this script decides where the file lands; the component turns it into
// a URL with `useBaseUrl`.
const PUBLIC_PATH = `/skills/${SKILL_NAME}.zip`;

// Both Codex CLI and DeepSeek Harness require lower-case kebab-case here, and
// DSH rejects anything else outright rather than falling back to the directory
// name.
const NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Files the skill cannot work without. `SKILL.md` is the contract; the two
// detection scripts are step 1 of that contract, and shipping only one of them
// would break exactly the OS the reader happens to be on.
const REQUIRED = ['SKILL.md', 'scripts/detect-env.sh', 'scripts/detect-env.ps1'];

const errors = [];

function fail(message) {
  errors.push(message);
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validate() {
  if (!fs.existsSync(SKILL_DIR)) {
    fail(`skill directory not found: ${path.relative(PROJECT_ROOT, SKILL_DIR)}`);
    return;
  }

  for (const rel of REQUIRED) {
    if (!fs.existsSync(path.join(SKILL_DIR, rel))) {
      fail(`missing required file: ${rel}`);
    }
  }

  const skillMd = path.join(SKILL_DIR, 'SKILL.md');
  if (!fs.existsSync(skillMd)) return;

  const raw = fs.readFileSync(skillMd);

  // A BOM puts three invisible bytes in front of the opening delimiter, so the
  // parser never sees frontmatter at all and reports a skill with no metadata.
  if (raw.length >= 3 && raw[0] === 0xef && raw[1] === 0xbb && raw[2] === 0xbf) {
    fail('SKILL.md starts with a UTF-8 BOM; frontmatter will not parse');
  }

  const text = raw.toString('utf8');
  const lines = text.split('\n');

  // The delimiter must be exactly `---`. A markdown editor that "tidies" this
  // into `***` or a long dash run produces a file that still renders as
  // markdown while carrying no metadata whatsoever.
  if (lines[0] !== '---') {
    fail(`SKILL.md line 1 must be exactly "---", found ${JSON.stringify(lines[0])}`);
  }

  const closing = lines.indexOf('---', 1);
  if (closing === -1) {
    fail('SKILL.md has no closing "---" frontmatter delimiter');
    return;
  }

  const frontmatter = lines.slice(1, closing);
  const field = (key) => {
    const hit = frontmatter.find((line) => line.startsWith(`${key}:`));
    return hit ? hit.slice(key.length + 1).trim() : null;
  };

  const name = field('name');
  if (!name) {
    fail('SKILL.md frontmatter has no "name"');
  } else if (!NAME_PATTERN.test(name)) {
    fail(`SKILL.md "name" must be lower-case kebab-case, found ${JSON.stringify(name)}`);
  } else if (name !== SKILL_NAME) {
    // The directory name is what the reader unzips and what the docs tell them
    // to look for; a mismatch makes the verification step in the docs fail.
    fail(`SKILL.md "name" is ${JSON.stringify(name)} but the directory is ${JSON.stringify(SKILL_NAME)}`);
  }

  const description = field('description');
  if (!description) {
    fail('SKILL.md frontmatter has no "description"');
  } else if (description.length < 40) {
    // Implicit invocation matches on the description alone, so a stub here
    // means the skill only ever triggers when named explicitly.
    fail('SKILL.md "description" is too short to drive implicit invocation');
  }
}

// ---------------------------------------------------------------------------
// Zip writer
// ---------------------------------------------------------------------------

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }
  return table;
})();

function crc32(buffer) {
  let c = -1;
  for (let i = 0; i < buffer.length; i += 1) {
    c = CRC_TABLE[(c ^ buffer[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ -1) >>> 0;
}

// Fixed timestamp rather than the file mtime, so identical sources always
// produce a byte-identical archive. Without this every docs build emits a
// different download for unchanged content.
const DOS_TIME = 0;
const DOS_DATE = ((2020 - 1980) << 9) | (1 << 5) | 1;

function localHeader(entry) {
  const name = Buffer.from(entry.name, 'utf8');
  const head = Buffer.alloc(30);
  head.writeUInt32LE(0x04034b50, 0);
  head.writeUInt16LE(20, 4);
  head.writeUInt16LE(0, 6);
  head.writeUInt16LE(entry.method, 8);
  head.writeUInt16LE(DOS_TIME, 10);
  head.writeUInt16LE(DOS_DATE, 12);
  head.writeUInt32LE(entry.crc, 14);
  head.writeUInt32LE(entry.csize, 18);
  head.writeUInt32LE(entry.usize, 22);
  head.writeUInt16LE(name.length, 26);
  head.writeUInt16LE(0, 28);
  return Buffer.concat([head, name]);
}

function centralHeader(entry) {
  const name = Buffer.from(entry.name, 'utf8');
  const head = Buffer.alloc(46);
  head.writeUInt32LE(0x02014b50, 0);
  // "Made by" UNIX, so the mode bits in the external attributes are honoured
  // and `detect-env.sh` arrives executable on macOS and Linux.
  head.writeUInt16LE(0x031e, 4);
  head.writeUInt16LE(20, 6);
  head.writeUInt16LE(0, 8);
  head.writeUInt16LE(entry.method, 10);
  head.writeUInt16LE(DOS_TIME, 12);
  head.writeUInt16LE(DOS_DATE, 14);
  head.writeUInt32LE(entry.crc, 16);
  head.writeUInt32LE(entry.csize, 20);
  head.writeUInt32LE(entry.usize, 24);
  head.writeUInt16LE(name.length, 28);
  head.writeUInt16LE(0, 30);
  head.writeUInt16LE(0, 32);
  head.writeUInt16LE(0, 34);
  head.writeUInt16LE(0, 36);
  head.writeUInt32LE(entry.externalAttrs, 38);
  head.writeUInt32LE(entry.offset, 42);
  return Buffer.concat([head, name]);
}

function walk(dir, prefix, out) {
  const names = fs.readdirSync(dir).sort();
  for (const name of names) {
    const full = path.join(dir, name);
    const rel = prefix ? `${prefix}/${name}` : name;
    if (fs.statSync(full).isDirectory()) {
      out.push({ rel, dir: true });
      walk(full, rel, out);
    } else {
      out.push({ rel, dir: false, full });
    }
  }
}

function build() {
  const sources = [];
  walk(SKILL_DIR, '', sources);

  const chunks = [];
  const central = [];
  let offset = 0;

  // Every path is prefixed with the skill name so unzipping into
  // `~/.agents/skills/` lands at `~/.agents/skills/marsquakes-setup/SKILL.md`.
  // A flat archive would scatter SKILL.md next to unrelated skills instead.
  const push = (entry) => {
    const header = localHeader(entry);
    chunks.push(header);
    if (entry.body) chunks.push(entry.body);
    central.push(centralHeader({ ...entry, offset }));
    offset += header.length + (entry.body ? entry.body.length : 0);
  };

  push({
    name: `${SKILL_NAME}/`,
    method: 0,
    crc: 0,
    csize: 0,
    usize: 0,
    externalAttrs: ((0o40755 << 16) >>> 0) | 0x10,
  });

  for (const source of sources) {
    if (source.dir) {
      push({
        name: `${SKILL_NAME}/${source.rel}/`,
        method: 0,
        crc: 0,
        csize: 0,
        usize: 0,
        externalAttrs: ((0o40755 << 16) >>> 0) | 0x10,
      });
      continue;
    }

    const raw = fs.readFileSync(source.full);
    const deflated = zlib.deflateRawSync(raw, { level: 9 });
    // Storing is only worth it when deflate would grow the entry, which happens
    // with very small or already-compressed files.
    const useDeflate = deflated.length < raw.length;
    const mode = source.rel.endsWith('.sh') ? 0o100755 : 0o100644;

    push({
      name: `${SKILL_NAME}/${source.rel}`,
      method: useDeflate ? 8 : 0,
      crc: crc32(raw),
      csize: useDeflate ? deflated.length : raw.length,
      usize: raw.length,
      externalAttrs: (mode << 16) >>> 0,
      body: useDeflate ? deflated : raw,
    });
  }

  const centralBuffer = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(central.length, 8);
  end.writeUInt16LE(central.length, 10);
  end.writeUInt32LE(centralBuffer.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  return {
    buffer: Buffer.concat([...chunks, centralBuffer, end]),
    fileCount: sources.filter((s) => !s.dir).length,
  };
}

// ---------------------------------------------------------------------------
// Generated metadata
// ---------------------------------------------------------------------------

function writeMetadata({ kib, fileCount, byteLength }) {
  const lines = [
    '// GENERATED FILE - do not edit.',
    '//',
    `// Written by scripts/pack-skill.js on every docs \`dev\` / \`build\`, so the`,
    '// download button always advertises the archive that is actually shipped.',
    '// Edit the packer, not this file.',
    '',
    'export const archive = {',
    `  name: '${SKILL_NAME}.zip',`,
    `  path: '${PUBLIC_PATH}',`,
    `  size: '${kib} KiB',`,
    `  bytes: ${byteLength},`,
    `  fileCount: ${fileCount},`,
    '} as const;',
    '',
  ];

  const next = lines.join('\n');

  fs.mkdirSync(path.dirname(META_FILE), { recursive: true });

  // Only write when the content actually changes. The docs `dev` script runs the
  // packer on every start, and an unconditional write would touch the file on
  // each run, which retriggers the dev server's watcher in a loop.
  if (fs.existsSync(META_FILE) && fs.readFileSync(META_FILE, 'utf8') === next) {
    return;
  }

  fs.writeFileSync(META_FILE, next);
}

// ---------------------------------------------------------------------------

validate();

if (errors.length > 0) {
  console.error(`\n${path.relative(PROJECT_ROOT, SKILL_DIR)} is not packageable:\n`);
  for (const error of errors) {
    console.error(`  - ${error}`);
  }
  console.error('\nThe skill would be silently ignored by the agent, so no archive was written.');
  process.exit(1);
}

const { buffer, fileCount } = build();
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT_FILE, buffer);

const kib = (buffer.length / 1024).toFixed(1);

// Emit the same numbers as a module the site can import, so the download button
// cannot advertise a size the archive no longer has. Both locales previously
// hard-coded "17 KiB" by hand and both had silently gone stale.
//
// A `.ts` file rather than JSON: `@docusaurus/tsconfig` does not enable
// `resolveJsonModule`, so importing JSON would need a tsconfig change here for
// no gain. Unlike the archive — which is gitignored, being a build output — this
// file is generated but *committed*, so `pnpm type-check` works on a fresh
// checkout without running this script first.
writeMetadata({ kib, fileCount, byteLength: buffer.length });

console.log(`packed ${fileCount} files -> ${path.relative(PROJECT_ROOT, OUT_FILE)} (${kib} KiB)`);
