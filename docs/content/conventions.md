---
id: conventions
title: Conventions
sidebar_position: 6
---

# Conventions

These are the conventions baked into every project `mars create` generates. The
authoritative copy ships as `AGENTS.md` at the root of your project — which is
also what AI coding agents read as context — and this page mirrors it for
readers of the site.

## Directory rules

- **Internal design documents** go in `.docs/` — API documents in `.docs/api/`,
  tasks and PRDs in `.docs/task/`. The folder is dot-prefixed on purpose: it is
  engineering material and is never published.
- **Published pages** go in `docs/content/`, the content directory of the
  documentation site.
- **Design assets** (drafts, images, cutouts) go in `design/`.
- **Platform code** goes in `apps/<platform>/`; shared npm packages in
  `packages/`.
- Never drop documents or design files in the repository root. Temporary files
  belong in the system temp directory, not in the project tree.

## Documentation site

`docs/` is a Docusaurus site whose pages live in its own `content/`
subdirectory, so the site configuration never mixes with the prose. Practical
consequences:

- To add a page, create the Markdown file under `docs/content/` and add its id
  to `docs/sidebars.ts`. A file that is not listed there is not published.
- Internal task breakdowns and API interface documents are not part of the site
  at all — they live in `.docs/`.
- Chinese translations live in
  `docs/i18n/zh-Hans/docusaurus-plugin-content-docs/current/`, mirroring the
  English file names. The translation tree mirrors the *contents* of
  `content/`, so it has no extra `content/` level.
- UI strings are translated in `docs/i18n/zh-Hans/code.json`; regenerate the
  skeleton with `pnpm write-translations -- --locale zh-Hans`.

The site is **not a platform**. A platform is a shippable application target;
the documentation describes the project rather than being one of its targets.
So `docs/` is absent from `platforms.platforms` in `platforms.json` — it is
declared in a separate top-level `docs` section instead — and it is not a pnpm
workspace member. That keeps the Docusaurus dependency tree out of the root
lockfile and out of the Turborepo task graph, at the cost of `pnpm --filter
docs` not resolving. Run its scripts from the repository root with
`pnpm -C docs <script>`, which changes directory instead of going through
workspace resolution.

## Commit messages

Commit messages **must be English** and follow conventional commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`,
`perf`, `ci`, `revert`.

Rules that are easy to get wrong:

- Imperative mood — "Add", not "Added" or "I added".
- Subject line under 50 characters, no trailing period, first letter capitalised.
- Blank line between subject and body; wrap the body at 72 characters.
- The body must be English too, including bullet points.
- One logical change per commit; do not mix unrelated work.

## Branches

`main` is the trunk. Features go on `feature/xxx`, fixes on `fix/xxx`.

## Code style

- **Code comments are written in English**, including Dockerfiles, compose files
  and configuration such as `docusaurus.config.ts`.
- Follow the conventions already present in the file you are editing — style,
  naming, and the libraries it already depends on.
- Each platform directory carries its own `AGENTS.md` with platform-specific
  rules; read it before touching that platform.

## Ignored files

`.idea/`, `.gradle/`, `local.properties`, `node_modules/`, `dist/`, `.turbo/`,
`.docusaurus/`, `/docs/build` and `.env` are all gitignored. Note that the
build output is ignored by its exact path rather than a bare `build/` pattern,
because `apps/web-admin/build/` is tracked source (Vite build configuration).
Never commit secrets — use `.env`, and keep `.env.example` and `.env.example.cn`
as the documented templates. Only `.env` itself is ignored (an exact rule, not
`.env*`), so the templates stay tracked.
