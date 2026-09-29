# AGENTS.md — Web Admin

## Scope

This directory is the **Web Admin** platform: JeecgBoot Vue3 front end built
with Vue 3 + Vite + Ant Design Vue 4 + TypeScript. Requires Node >= 22.12
(`engines`). This package is a pnpm workspace member; **pnpm is the only
package manager** (never npm/npx/yarn).

**This file only documents web-admin-specific rules.** Cross-platform rules
(pnpm-only, English commit messages, documentation placement, restart-after-change,
platform-specific command formatting) are inherited from the root
[AGENTS.md](../../AGENTS.md) and must not be duplicated here.

## Common Commands

Run from this directory, or from the monorepo root with
`pnpm dev --filter=web-admin` / `pnpm build --filter=web-admin`.

```bash
pnpm dev               # Dev server on http://localhost:8807 (mock enabled by default)
pnpm build             # Production build (output: dist/)
pnpm build:docker      # Production build for Docker
pnpm preview           # Build then preview
pnpm clean:cache       # Clear the Vite cache
pnpm batch:prettier    # Format all source files

pnpm exec eslint src/path/to/file.vue          # Lint a single file
pnpm exec stylelint "src/**/*.{vue,less,css}"  # Lint styles
```

There is no aggregate `lint` script and no `test` script; Jest is configured for
the `tests/` directory and is run manually if needed (`pnpm exec jest`).

The dev server port is **8807** in every environment — set by `VITE_PORT` in
[.env](.env) and mirrored by `Dockerfile.dev`. Do not reintroduce a separate
per-environment port. In the compose stack the published port is the edge nginx
entry point `NGINX_HOST_PORT` (default 80), not this dev server port.

## Adding a Business Feature

Pages live under `src/views/<domain>/<feature>/` using the co-located
"three-file + components" layout. The API module is kept next to the page, not
in `src/api/` (which holds only global `sys`/`common` interfaces):

```
src/views/system/<feature>/
├── index.vue             # List / main page
├── <feature>.api.ts      # Request functions for this feature
├── <feature>.data.ts     # Table columns, form schema
└── components/            # Modals and sub-components
```

### Routing is backend-driven — do not edit router code for normal pages

- Permission mode is `BACK`: menus/routes are fetched via
  `getBackMenuAndPerms()` and converted by
  [src/router/helper/routeHelper.ts](src/router/helper/routeHelper.ts).
- [src/utils/dynamicPages.ts](src/utils/dynamicPages.ts) collects
  `src/views/**/*.{vue,tsx}` via `import.meta.glob`; the `sys_permission.component`
  value (e.g. `system/dict/index`) selects the lazy chunk.
- Therefore: create the view files, then register the menu under
  System Management → Menu. No static route entry is needed.
- Only pages that must exist outside the menu (login, error pages) go in
  `src/router/routes/modules/`, which is auto-collected by glob.

## Importing Online-Generated Code (End-to-End)

When a module is produced by Online code generation, do not recreate the pages
by hand — move the generated front end in and apply only the adjustments below.
The backend steps (model the table, generate MVC, register the menu via the
permission API, restart the API) are in
[apps/api/AGENTS.md](../api/AGENTS.md#adding-a-module-via-online-code-generation-end-to-end).

The generator writes to `projectPath` when it targets this project, otherwise
you download a zip (`导到生成代码_<table>_<timestamp>.zip`) and unpack it. The
generated front end for a single table looks like:

```
src/views/<entityPackagePath>/
├── <Entity>List.vue          # List page — note the "List" suffix, not index.vue
├── <Entity>.api.ts           # Request functions (enum Api + defHttp)
├── <Entity>.data.ts          # columns / searchFormSchema / superQuerySchema
├── V<date>_1__menu_insert_<Entity>.sql
└── components/
    ├── <Entity>Modal.vue     # Modal wrapper
    └── <Entity>Form.vue      # Form body
```

1. **Move the folder into [src/views](src/views).** Copy
   `src/views/<entityPackagePath>/` into this project's `src/views/`, keeping
   the relative layout intact — `List.vue` imports the API as `./<Entity>.api`
   and the modal as `./components/<Entity>Modal.vue`. For one-to-many styles
   also keep the extra outputs (`subTables/*`, the `[1-n]List.vue` page, or the
   JVxe form) in place.
2. **Apply necessary adjustments only.** In practice the generated code already
   matches this project, so most files need no edits:
   - imports use the `/@/` alias and requests use `defHttp` — do **not** change
     them or hard-code a base URL (the `/marsquakes-api` proxy and the Docker alias
     `marsquakes-api` already resolve them);
   - no router edit is needed — routing is resolved from the backend menu and
     `dynamicPages`;
   - standard CRUD endpoints need no Shiro whitelist entry.
   The adjustments that are genuinely required:
   - **entry filename vs. menu component:** the page is `<Entity>List.vue`.
     Either keep that name and let the generated menu SQL point at
     `<entityPackagePath>/<Entity>List`, or rename it to `index.vue` and change
     the menu SQL's `component` to match — the two must agree;
   - **custom buttons:** generated button handlers are placeholders
     (`...业务逻辑需自行实现`), implement their behaviour;
   - wire any generated dict codes, upload components and field labels to real
     dictionaries/resources, and adjust columns/schemas for product wording.
3. **Register the menu via the API — do not apply the SQL file.** The included
   `V<date>_1__menu_insert_<Entity>.sql` only documents the route, six button
   permissions and the admin grant. In the verified flow those rows are created
   through `POST /sys/permission/add` and
   `POST /sys/permission/saveRolePermission` (step 8 in
   [apps/api/AGENTS.md](../api/AGENTS.md#adding-a-module-via-online-code-generation-end-to-end)),
   keeping the "HTTP API only, no direct database edits" rule. Do not place the
   SQL in Flyway or run it by hand. Its one front-end-relevant value is the
   `component` path — it must match where you placed `List.vue`
   (`<entityPackagePath>/<Entity>List`).
4. **Restart the API, keep Vite running.** The API must restart for the new
   controller, while Vite hot-reloads the moved pages. Log in and verify the
   list, add/edit modal, delete and import/export end to end. Remember dev has
   **mock enabled by default** — point Vite at the real API with a local
   `.env.development.local` (see
   [Environment Variables](#environment-variables) for the full template).
   The dev API is pinned to port **8817**.

## Architecture Notes

- **Bootstrap** ([src/main.ts](src/main.ts)): router → pinia → i18n →
  `registerPackages` (`@jeecg/online`) → `registerGlobComp` → `registerSuper`
  (`src/views/super/**/register.ts`) → guards → directives → mount.
- **HTTP layer:** custom Axios wrapper in `src/utils/http/axios/` (`defHttp`).
  Requests are MD5-signed; tenant header is injected when tenant mode is on.
  Response shape is `{ code, result, message, success }`, success when
  `code === 200`. Dev proxy forwards `/marsquakes-api` to
  `http://localhost:8817/marsquakes-api` (see [.env.development](.env.development));
  in Docker the target is the network alias `marsquakes-api`.
- **Components:** Ant Design Vue components are auto-imported
  (`unplugin-vue-components`). Global manual components are registered in
  [src/components/registerGlobComp.ts](src/components/registerGlobComp.ts).
  Prefer `createAsyncComponent` / dynamic `import()` for non-critical heavy
  components so they stay out of the initial bundle.
- **State:** Pinia modules in `src/store/modules/` — `user` (token, profile,
  roles, dict), `permission` (dynamic routes/menus), `app`, `locale`,
  `multipleTab`. Auth is persisted via `src/utils/auth`.
- **Path aliases:** `/@/` and `@/` → `src/` (prefer the `/@/` form, it is the
  project convention); `#/` → `types/`; `~icons/{collection}/{name}` →
  unplugin-icons.
- **Icons:** Iconify runtime, SVG sprites (`name|svg`), or `~icons/*`
  compile-time icons.
- **External packages:** `@jeecg/online` / `@jeecg/aiflow` are CJS packages
  excluded from `optimizeDeps` and registered through `registerPackages`.

## Environment Variables

- [.env](.env) — base config (port 8807, title, SSO/qiankun flags)
- [.env.development](.env.development) — `VITE_USE_MOCK=true`, dev proxy target
- `.env.production` — mock disabled, gzip
- `.env.docker` / `.env.dockercloud` — container build profiles

**Mock is enabled by default in development.** To exercise the real API, create
a gitignored `.env.development.local` (covered by `.env.*.local` in
[.gitignore](.gitignore)) — do not commit it. The verified-working template
below disables mock, retargets the `/marsquakes-api` proxy at the API port
actually in use, and sets the runtime domain:

```text
# Local dev overrides (gitignored): hit the real API, no mock
VITE_USE_MOCK = false

VITE_PROXY = [["/marsquakes-api","http://localhost:8817/marsquakes-api"],["/upload","http://localhost:3300/upload"]]

VITE_GLOB_DOMAIN_URL=http://localhost:8817/marsquakes-api
```

Port `8817` matches the dev backend port set in the API `application-dev.yml`;
keep the `/marsquakes-api` context path. Restart Vite after editing this file —
Vite does not hot-reload env changes. `VITE_GLOB_*` values are emitted to
`dist/_app.config.js` and can be changed post-build.

## Code Style

- Prettier: 150 width, single quotes, trailing commas (es5), 2-space indent,
  `vueIndentScriptAndStyle: true`.
- ESLint: Vue3 + TypeScript recommended; `any` is allowed; unused vars
  prefixed with `_` are ignored; the `prettier/prettier` rule is off, so run
  Prettier separately.
- Commit messages follow the root rules (English Conventional Commits); the
  local commitlint extra types such as `wip` do not override that.
- i18n: Chinese and English, locale files in `src/locales/lang/`.
