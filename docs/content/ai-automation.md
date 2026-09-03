---
id: ai-automation
title: Automate with AI
sidebar_position: 10
---

# Automate with AI

Everything in [Build a Project with AI](./ai-workflow.md) assumes you are
watching. This page covers the other mode: the agent runs unattended, in a
script or a CI job, and something downstream reads its exit code.

## `codex exec`

The non-interactive entry point. It runs one task and exits:

```bash
codex exec "Read platforms.json and list every enabled platform, one per line"
```

`codex e` is the short alias. Unlike the TUI there is no prompt to answer, so
the approval policy must be settled up front — an unattended run that pauses for
approval is just a hang with extra steps.

```bash
codex exec -s workspace-write -a never "Regenerate the API docs under .docs/api"
```

:::warning `-a never` needs a bounded sandbox
`approval_policy = "never"` removes the human check. That is acceptable only
when `sandbox_mode` still confines the damage. `-a never` together with
`--yolo`, or with `danger-full-access`, means an unattended process with no
limits on your filesystem.
:::

## A scripted scaffold

The scaffolding stage automates cleanly because the default platform set needs
no interaction:

```bash
#!/usr/bin/env bash
set -euo pipefail

mars create admin-platform --non-interactive
cd admin-platform
cp .env.example .env
pnpm install
```

Anything other than the default set does **not** automate cleanly. `mars create`
has no `--platform` flag, so a different combination has to answer the numbered
prompt, and the numbers shift whenever a platform is added to `platforms.json`.
Piping a fixed `6` into it is a bug waiting for the next release.

## Reading results back

The CLI is written for humans, so an automated caller should verify state from
files rather than parse prose:

```bash
node -e "const p=require('./platforms.json').platforms;for(const c in p)for(const k in p[c])if(p[c][k].enabled)console.log(k)"
# web-admin
# api
```

```bash
ls apps
```

Both are stable across CLI output changes, which prose is not.

## Exit codes

| Source | Contract |
| ------ | -------- |
| `mars` | `0` success, `1` any failure — a usage error and a missing toolchain are indistinguishable |
| `codex exec` | non-zero when the task could not be completed |
| `pnpm -C docs build` | non-zero on a broken internal link (`onBrokenLinks: 'throw'`) |
| `pnpm check:env` | non-zero when the two `.env` templates have drifted |

`mars`' coarse exit code is the main limitation. A wrapper that needs to tell
causes apart has to inspect the output or probe the environment itself.

## In CI

Two rules carry most of the weight.

**Never run `mars dev` in CI.** It does not return. Use `mars build`, or the
Docker compose files.

**Choose the right compose file:**

```bash
# Clean checkout, no local JDK or Node toolchain — compiles inside the image
docker compose -f docker-compose.build.yml up -d
```

```bash
# Artifacts already compiled by an earlier pipeline stage — packages only
docker compose up -d
```

The plain file has no compile stage on purpose: it builds in seconds and fails
loudly when the artifact is absent, instead of silently recompiling and hiding a
broken upstream step.

## Keeping the agent inside the rails

Unattended runs have nobody to catch a wrong turn, so narrow the task before you
launch it:

- **Scope the directory.** `codex exec -C apps/api "..."` roots the run in one
  platform. Combined with `workspace-write`, nothing outside it can be touched.
- **Ask for one thing.** "Update the changelog" is checkable; "clean up the
  project" is not.
- **Point at the convention file.** `apps/api/AGENTS.md` in the prompt beats a
  paragraph of restated rules, and it cannot drift from the repository.
- **Verify separately.** Run `pnpm -C docs build` or `git diff --stat` as its
  own step, so a failure is attributed to the check rather than buried in the
  agent's transcript.
- **Never commit automatically** unless that is the explicit job. Leave the
  working tree dirty and let a human read the diff.

## What is deliberately not automated

| Step | Why it stays manual |
| ---- | ------------------- |
| Non-default platform selection | numbered prompt, indexes shift between releases |
| First database start | passwords are baked into the volume once and never re-read |
| Publishing a docs page | `docs/sidebars.ts` registration is meant to be a deliberate decision |
| `git commit` on a release | commit granularity is a human judgement call |
