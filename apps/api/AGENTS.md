# AGENTS.md — Backend API

## Scope

This directory is the **Backend API** platform: JeecgBoot 3.9.3, a Java low-code
platform on Spring Boot 4.1.0. It runs as a monolith by default; Spring Cloud
microservices are optional and profile-gated. Java 17 (also supports 21/24).
The `jakarta` namespace is used throughout — never `javax`.

**This file only documents API-specific rules.** Cross-platform rules
(pnpm-only, English commit messages, documentation placement, restart-after-change,
platform-specific command formatting) are inherited from the root
[AGENTS.md](../../AGENTS.md) and must not be duplicated here.

## Module Architecture

The aggregator/parent POM is [pom.xml](pom.xml). The layout below reflects the
modules actually present in this checkout:

```
jeecg-boot-parent (apps/api/pom.xml, packaging=pom)
├── jeecg-boot-base-core            # Core: Shiro/JWT auth, MyBatis-Plus config,
│                                   # common utilities, AOP, base controllers
├── jeecg-module-system (pom)       # System management
│   ├── jeecg-system-api (pom)      # local-api vs cloud-api switch
│   │   ├── jeecg-system-local-api  # Entities/interfaces/VOs for the monolith
│   │   └── jeecg-system-cloud-api  # Feign clients for microservices
│   ├── jeecg-system-biz            # System business logic (depends on airag)
│   └── jeecg-system-start          # Main entry, configs, Flyway, executable jar
└── jeecg-boot-module (pom)         # Business / extension modules
    ├── jeecg-module-demo           # Minimal business-module template
    ├── jeecg-boot-module-airag      # AI / RAG (LangChain4j, MCP, knowledge base)
    └── jeecg-module-agenttest       # End-to-end Online-generation verified module
```

`jeecg-server-cloud/` is aggregated only under the `SpringCloud` profile
(gateway, Nacos, cloud starters). Do not assume it is built in the default
monolith workflow.

Module directory names use two upstream prefixes side by side —
`jeecg-module-*` (`demo`, `agenttest`) and `jeecg-boot-module-*` (`airag`).
This is an upstream inconsistency, not a typo; never rename existing
directories to "fix" it. For new modules prefer `jeecg-module-<name>`, matching
the demo template, and always use the literal directory name in POM paths and
dependencies.

Runtime dependency chains already in use — follow the matching one:

- `jeecg-system-start → jeecg-module-demo` for a standalone business module.
- `jeecg-system-start → jeecg-module-agenttest` for an Online-generated CRUD
  module (the pattern proven by the end-to-end run below).
- `jeecg-system-start → jeecg-system-biz → jeecg-boot-module-airag` for a module
  that system business logic also needs to call.

## Build & Run

The application uses context path `/jeecg-boot`. **All profiles are pinned
to port 8817** (`server.port` in every `application-*.yml`) to avoid the
frequently contended 8080; it can still be overridden with
`--server.port=<n>`. Dev requires reachable MySQL and Redis
(see root `docker-compose.infra.yml`).

`spring-boot:run` cannot be combined with `-am` in this multi-module build, so
the two-step form below is the reliable one (install everything, then run from
the start module):

**macOS / Linux**

```bash
mvn clean install -DskipTests
cd jeecg-module-system/jeecg-system-start
mvn spring-boot:run
```

**Windows (PowerShell)**

```powershell
mvn clean install -DskipTests
cd jeecg-module-system\jeecg-system-start
mvn spring-boot:run
```

Other useful tasks (identical on both platforms):

```bash
mvn clean package                                   # Full build
mvn clean package -DskipTests=false                 # Build with tests
mvn clean package -pl jeecg-boot-base-core -am      # One module + dependencies
mvn test -DskipTests=false -pl <module> -Dtest=<TestClassName>
mvn clean package -P SpringCloud                    # Include microservices modules
```

From the monorepo root the CLI wraps the above: `mars dev --platform api`
(host) or `mars dev --platform api --docker` (dev container,
`Dockerfile.dev`). After any change here, restart the API before finishing, per
the root AGENTS.md.

## Adding a Business Module

1. Create `jeecg-boot-module/jeecg-boot-module-<name>/pom.xml` with
   `<parent>` pointing at `jeecg-boot-module` (copy
   [jeecg-module-demo/pom.xml](jeecg-boot-module/jeecg-module-demo/pom.xml)).
2. Register it in [jeecg-boot-module/pom.xml](jeecg-boot-module/pom.xml)
   under `<modules>`.
3. Put it on the runtime classpath: add the dependency to
   [jeecg-system-start/pom.xml](jeecg-module-system/jeecg-system-start/pom.xml)
   (standalone), or to
   [jeecg-system-biz/pom.xml](jeecg-module-system/jeecg-system-biz/pom.xml)
   when system logic must reuse it.
4. Optionally pin a version in the root
   [pom.xml](pom.xml) `dependencyManagement`.
5. Place Java code under `org.jeecg.modules.<name>.**`. The main class is a
   plain `@SpringBootApplication` in package `org.jeecg`, so this package prefix
   is component-scanned automatically — do not modify the application class.
6. For new tables, add a Flyway migration (see below) rather than hand-editing
   the base dump.
7. For microservice deployment, also wire the module into
   [jeecg-server-cloud/pom.xml](jeecg-server-cloud/pom.xml).

## Adding a Module via Online Code Generation (End-to-End)

The preferred way to add a CRUD module is **not** to hand-write the MVC stack.
Define the table through the Online HTTP API and let the generator emit the
backend layers plus the web-admin front end. Every numbered step below is an
authenticated HTTP call — do not edit the database directly. The front-end
moves are in [apps/web-admin/AGENTS.md](../web-admin/AGENTS.md#importing-online-generated-code-end-to-end).

The `/online/cgform/api/**` endpoints ship in an external jar, and the
Freemarker templates live in this repo under
[jeecg-system-biz/src/main/resources/jeecg/code-template-online](../jeecg-module-system/jeecg-system-biz/src/main/resources/jeecg/code-template-online).
Do not add `org.jeecg.modules.online` controllers by hand. The generator output
root is **not** a request parameter: it is `project_path` in
[jeecg_config.properties](../jeecg-module-system/jeecg-system-start/src/main/resources/jeecg/jeecg_config.properties),
loaded from the classpath by the `codegenerate` engine.

Examples use `BASE=http://localhost:8817/jeecg-boot` and the header
`X-Access-Token: $TOKEN`. `curl` runs on macOS/Linux; on Windows use
`curl.exe` (the PowerShell `curl` alias has different syntax).

1. **Set the output directory before the first build.** Edit
   [jeecg_config.properties](../jeecg-module-system/jeecg-system-start/src/main/resources/jeecg/jeecg_config.properties):
   set `project_path` to an empty scratch directory (escaped backslashes on
   Windows, e.g. `C:\\Users\\...\\Temp\\agenttest_ongen`); leave
   `bussi_package=org.jeecg.modules`. Then build once:
   `mvn clean package -pl jeecg-module-system/jeecg-system-start -am -DskipTests`.
   Never patch the fat jar with a zip tool — nested `BOOT-INF/lib` entries must
   stay STORED; the Maven `spring-boot-maven-plugin:repackage` goal is the only
   supported assembly step.
2. **Start the API with the login captcha disabled.** Dev sets
   `enableLoginCaptcha: false` and pins the port to 8817. When running the jar
   (which does not activate dev automatically), pass both flags explicitly:
   `--jeecg.firewall.enable-login-captcha=false --server.port=8817`
   (choose another port only if 8817 is taken). MySQL and Redis must be
   reachable.
3. **Log in and take the token.** `POST /sys/login` with JSON
   `{"username":"admin","password":"...","captcha":"","checkKey":0}`. Never
   hard-code the password in a committed file or script under the repo. Read
   `result.token` from the response and send it as `X-Access-Token` on every
   later call.

   ```bash
   curl.exe -s -X POST "$BASE/sys/login" -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"'$ADMIN_PASSWORD'","captcha":"","checkKey":0}'
   ```

4. **Create the Online form (metadata only).** `POST /online/cgform/api/addAll`
   with `Content-Type: application/json` — form-encoded bodies are rejected, as
   is GET. The payload is `head` (table definition), `fields` (columns) and
   `indexs` (indexes). The physical table does not exist yet. Capture
   `result` from the response; that head id is the `code` used in later steps.

   ```json
   {
     "head": {
       "tableName": "agent_e2e_note_v2",
       "tableTxt": "AI E2E Note",
       "tableType": 1,
       "idType": "UUID",
       "formCategory": "temp"
     },
     "fields": [
       {
         "dbFieldName": "title",
         "dbFieldTxt": "Title",
         "dbType": "varchar",
         "dbLength": 200,
         "fieldLength": 200,
         "fieldValidType": "string",
         "isNull": 0
       },
       {
         "dbFieldName": "content",
         "dbFieldTxt": "Content",
         "dbType": "text",
         "fieldValidType": "string",
         "isNull": 1
       }
     ],
     "indexs": []
   }
   ```

5. **Synchronise the physical table.** `POST /online/cgform/api/doDbSynch/{code}/normal`
   — GET and PUT are not supported. `normal` keeps existing table data; `force`
   drops and recreates the table. This creates/updates the physical MySQL table
   and flips the head's `isDbSynch` to `Y`.
6. **Generate the code.** `POST /online/cgform/api/codeGenerate` (GET is not
   supported) with JSON:

   ```json
   {
     "code": "<head-id>",
     "tableName": "agent_e2e_note_v2",
     "entityName": "AgentE2ENoteV2",
     "entityPackage": "agenttest",
     "ftlDescription": "AI E2E Note",
     "packageStyle": "service",
     "jspMode": "one",
     "vueStyle": "vue3",
     "jformType": "1",
     "codeTypes": "controller,service,dao,mapper,entity,vue"
   }
   ```

   The endpoint returns `success:true` even when generation fails — verify that
   `result` is a list of absolute file paths. Under
   `project_path/src/main/java/org/jeecg/modules/<entityPackage>/` appear
   `controller`, `entity`, `mapper` (+ `mapper/xml`), `service` and
   `service/impl`; the front end lands in a `vue3/` directory together with a
   `V1.menu_insert_<Entity>.sql` reference file.
7. **Place the backend files.** Copy the generated Java tree into the owning
   module under `jeecg-boot-module/` (create and register it per
   [Adding a Business Module](#adding-a-business-module)), keeping the
   `org.jeecg.modules.<entityPackage>` path so component scanning picks it up.
   Rebuild with a targeted reactor, not a root-wide build — a bare
   `mvn clean install` from `apps/api` also enters `jeecg-server-cloud` under
   the default profile, downloads large cloud dependencies and leaves
   `*.jar.original` files in cloud `target/` directories. Build only the start
   module and its dependencies (which includes the new business module):

   ```bash
   mvn clean install -pl jeecg-module-system/jeecg-system-start -am -DskipTests
   ```
8. **Create the menu and authorise it, all via the permission API.**
   - `POST /sys/permission/add` once for the page: `menu_type=0`,
     `name` = the form label, `url` = `/agenttest/agentE2ENoteV2List`,
     `component` = `agenttest/AgentE2ENoteV2List` (substitute your package and
     entity names).
   - `POST /sys/permission/add` six times for the buttons, each with
     `menu_type=1` and `parentId` = the new page id, `perms` =
     `<entityPackage>:<tableName>:add`, `:edit`, `:delete`, `:deleteBatch`,
     `:exportXls`, `:importExcel`.
   - Grant all seven ids: find the admin role via
     `GET /sys/role/list?column=roleCode&value=admin` (standard dump id
     `f6817f48af4fb3af11b9e8bf182f618b`), then
     `POST /sys/permission/saveRolePermission` with
     `{"roleId":"<role-id>","permissionIds":"<id1,id2,...>","lastpermissionIds":""}`.
     The generated `V1.menu_insert_*.sql` documents the same values; use these
     endpoints rather than applying it to the database.
9. **Restart the API** — new controllers and beans are not hot-reloadable — and
   verify CRUD on
   `/<entityPackage>/<tableName>/list|add|edit|delete|exportXls|importExcel`
   with the token.
10. **Place the front end.** Copy the five files under the generated `vue3/`
    directory into `apps/web-admin/src/views/<entityPackage>/` (see
    [apps/web-admin/AGENTS.md](../web-admin/AGENTS.md#importing-online-generated-code-end-to-end)),
    then open the new menu in the browser and exercise add/edit/delete.

The generated CRUD endpoints are **authenticated by default** — do not add them
to the Shiro whitelist. Only when a generated endpoint must be reachable
without login, append it to `jeecg.shiro.excludeUrls` in the relevant profile
(comma-separated, `/**` supported).

## Cleaning Up / Rolling Back a Generated Module

After the flow is verified, remove the test scaffolding so the checkout does
not accumulate scratch files. These are the exact cleanup operations from the
verified run; every destructive call below is authenticated and goes through
HTTP, not the database.

1. **Delete the Online head.** Find the head id via
   `GET /online/cgform/head/list`, then
   `DELETE /online/cgform/head/deleteBatch?ids=<head-id>&flag=1`. `flag=1`
   drops the physical table as well; `flag=0` keeps it. Do not leave
   throwaway heads in the list.
2. **Remove the menu (only when discarding the module).**
   `DELETE /sys/permission/deleteBatch?ids=<page-id>,<btn-id1>,...` — the same
   seven ids created in step 8. Skip this when the module is being kept.
3. **Discard local secrets and scratch output.** Delete the file holding the
   login token (never store it under the repo), and delete the empty scratch
   directory used as `project_path` together with the generated tree inside it.
4. **Delete runtime-extracted template copies.** `CodeTemplateInitListener`
   unpacks the Freemarker templates into a `config/` directory under the **JVM
   working directory** at startup — `jeecg-system-start/config/` when launched
   from that module, or the repository-root `config/` when launched from the
   monorepo root. Both are untracked runtime artifacts. Verify tracking before
   deleting (`git ls-files -- <path>` must return nothing, and
   `git status --short -- <path>` shows `??`), then remove the directory.
5. **Remove stray `*.jar.original` files.** If a root-wide reactor build ever
   ran, cloud modules keep `*.jar.original` next to their repackaged jars.
   Locate with `Get-ChildItem -Recurse -Filter *.jar.original` (PowerShell) or
   `find . -name '*.jar.original'`, confirm they are build outputs under
   `target/`, and delete them.
6. **Restore generator config.** Revert `project_path` (and `bussi_package` if
   it was changed) in
   [jeecg_config.properties](../jeecg-module-system/jeecg-system-start/src/main/resources/jeecg/jeecg_config.properties)
   to the upstream defaults — `git diff` on the file must be empty. The
   dev-only `enableLoginCaptcha: false` in `application-dev.yml` and the two
   POM registrations stay when the module is kept; revert them only on a full
   rollback.

Keep (do not delete) when the module is a real deliverable: the generated
module directory under `jeecg-boot-module/`, its two POM registrations, the
seven permission rows, and the five front-end files under
`apps/web-admin/src/views/`.

## Code Conventions

- **Package layout:** `org.jeecg.modules.<name>.{controller,entity,mapper,service,service.impl,vo}`.
  Mapper XML may live alongside the Java sources (the build packages
  `**/*.xml` under `src/main/java`).
- **Entities:** `@Data`, `@EqualsAndHashCode(callSuper = false)`,
  `@Accessors(chain = true)`, `@TableName`, `@TableId(type = IdType.ASSIGN_ID)`.
  System entities use the `Sys` prefix (`SysUser`, `SysRole`).
- **Controller:** `<Entity>Controller extends JeecgController<Entity, IService>`
  to inherit standard CRUD plus Excel import/export.
- **Service:** interface `I<Entity>Service extends IService<Entity>`; impl
  `<Entity>ServiceImpl extends ServiceImpl<Mapper, Entity>`.
- **Mapper:** `<Entity>Mapper extends BaseMapper<Entity>`.
- **Responses:** always return `Result<T>` (`org.jeecg.common.api.vo.Result`):
  `Result.OK(data)`, `Result.OK(msg, data)`, `Result.error(msg)`.
- **List filtering:** `QueryGenerator.initQueryWrapper(entity,
  request.getParameterMap())` builds the `QueryWrapper` from request params
  (fuzzy match, ranges) — prefer it over hand-built wrappers for standard lists.
- **Mono/micro switch:** implemented by swapping `local-api` for `cloud-api` at
  the dependency level. Do not fork business code for it.
- **Comments:** follow the global rule — no change-marker or attribution comment
  blocks are required when editing code.

## Persistence & Configuration

- **Databases:** MySQL 8.0+ by default; PostgreSQL, Oracle, SQL Server,
  MariaDB, DM8, KingBase supported via `application-<dbtype>.yml` profiles.
- **Baseline schema:** import [db/jeecgboot-mysql-5.7.sql](db/jeecgboot-mysql-5.7.sql)
  once. Despite the name it loads cleanly on MySQL 8.0; it is not a 5.7
  requirement.
- **Flyway:** incremental migrations under
  `jeecg-system-start/src/main/resources/flyway/sql/mysql/` (date-named
  folders). Dev enables `spring.main.lazy-initialization=true`, so Flyway
  auto-config is explicitly excluded and managed by a dedicated config.
- **Config files:** all in
  `jeecg-module-system/jeecg-system-start/src/main/resources/` —
  `application.yml` selects the Maven-filtered profile, `application-dev.yml`
  holds dev defaults, `application-docker.yml` the container profile. Platform
  features live under the `jeecg.*` namespace.
- **Online low-code:** runtime CRUD is metadata-driven from `onl_cgform_*`
  tables, not generated code. That metadata is not readable from the source
  tree; ask for a JSON export or screenshot when an Online form needs changes.

## Stack at a Glance

| Layer | Technology |
|-------|-----------|
| ORM | MyBatis-Plus (`BaseMapper`, `ServiceImpl`) |
| Auth | Apache Shiro + JWT, Redis-backed sessions |
| Pool | Druid with dynamic datasource |
| JSON | FastJSON 2 |
| Excel | AutoPoi |
| API docs | Knife4j (OpenAPI v3, `@Schema`) |
| Scheduling | Quartz, JDBC clustered store |
| Storage | MinIO / Aliyun OSS / Qiniu (`jeecg.uploadType`) |
