---
id: guide-desktop-develop
title: Develop
---

# Desktop: Develop

The Tauri toolchain runs the frontend and the Rust backend together. Make sure
the Rust toolchain and the native system libraries are installed first — see
[Environment Setup](./guide-desktop-env.md).

## Step 1 — Run the full desktop app

Run from the platform directory:

```bash
cd apps/desktop
pnpm tauri dev
```

This starts the Vite dev server and compiles the Rust side in debug mode, then
opens the native window. The first run takes longer because Cargo builds its
dependencies.

## Step 2 — Frontend only, in a browser

For frontend-only work in a browser tab (no Rust, no native window):

```bash
cd apps/desktop
pnpm dev
```

## Project layout

Frontend code (React) is in `src/` and the Rust backend in `src-tauri/src/`;
the two sides talk through Tauri commands (`#[tauri::command]` on the Rust side,
`invoke()` on the frontend). SQLite is reached through `sqlx`. Before adding a
module, read `apps/desktop/AGENTS.md` — it documents the file-per-module layout
(`src/api/`, `src/components/<module>/`, `src-tauri/src/api/<module>.rs`), the
IPC response shape, and the eleven-step module workflow with a worked example.

## Step 3 — Let an AI agent build a feature

An AI coding agent running in the repository root can add the feature while you
drive it in ordinary sentences. The full conversation, including what to say
when something looks wrong, is on the AI track:
[Desktop App: Create a Feature](./ai-desktop-module.md). The short version:

1. Keep the app from Step 1 running (`pnpm tauri dev`).
2. Paste the prompt below, then **wait for the plan** before approving anything.
3. When it is done, let the window reload and press every new button yourself.

```text
Read `apps/desktop/AGENTS.md` first and follow the step-by-step workflow in it,
then show me your plan before changing anything. I want a product management
screen: I should be able to add, edit and delete products, and it should work in
both languages. List every file you changed when you are done.
```

A complete screen touches all three layers in `apps/desktop/AGENTS.md` —
storage, the Tauri commands connecting the sides, and the React screen — so
expect roughly ten changed files. The failure that *looks* like it worked is a
command the frontend calls but the Rust side never registers: the screen
renders, and the button only errors when clicked. If the file list is short or a
button errors, say: "you missed a layer or left it half-wired, check the
workflow file again and finish it." Ask for the plan first, and add one feature
at a time.

## Next

When the app runs the way you want, continue to
[Deploy](./guide-desktop-deploy.md) to produce an installer.
