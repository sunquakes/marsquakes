---
id: guide-desktop-deploy
title: Deploy
---

# Desktop: Deploy

Desktop deployment means producing the signed/installable bundle you hand to
someone running the same operating system.

## Step 1 — Build a release package

```bash
cd apps/desktop
pnpm tauri build
```

This produces signed/installable bundles for the current operating system under
`src-tauri/target/release/bundle/` — an MSI/NSIS installer on Windows, a `.app`
plus `.dmg` on macOS, and a deb/AppImage/rpm bundle on Linux.

## Step 2 — Know what `pnpm build` does not do

`pnpm build` on its own only runs the frontend type-check and Vite build — it
does **not** produce a desktop installer:

```bash
pnpm build   # tsc && vite build — frontend artifacts only
```

That distinction is also why `mars build --platform desktop` runs the frontend
workspace build rather than the Tauri bundler: packaging a native installer has
to happen from `apps/desktop` with the platform's own toolchain present —
`pnpm tauri build` is the command that produces something you can distribute.

## Next

For workspace-wide `mars dev`, `mars build` and `mars clean`, see
[Start a Project](./create-project.md#run-and-build-the-project), or the
[CLI Reference](./cli.md#mars-dev).
