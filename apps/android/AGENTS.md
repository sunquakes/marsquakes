# Android - AGENTS.md

This file holds the **Android-specific** rules and inherits the root
[AGENTS.md](../../AGENTS.md). Where the two ever disagree, the root wins.

## Module Overview

- **Application ID / Namespace**: `cc.marsquakes`
- **Product name**: always `Marsquakes` in user-facing strings and resources; the legacy name `RubyAlbum` is forbidden (see root AGENTS.md → Project Overview)
- **Tech Stack**: Android / Kotlin / Jetpack Compose / Hilt / DataStore
- **minSdk**: 33 / **targetSdk**: 36 / **compileSdk**: 36
- **Build Tool**: Gradle 8.13 (Kotlin DSL) / AGP 8.13.2 / Kotlin 2.0.21 / KSP 2.0.21-1.0.28
- **JVM Target**: Java 11
- **Version**: 1.0 (versionCode: 1)

## Architecture: Now in Android

The module graph follows Google's [Now in Android](https://github.com/android/nowinandroid)
layering: `app` is a thin shell, `feature:*` modules own screens, `core:*` modules own
capability, and `build-logic` owns the build convention. Dependencies point **inward and
downward only** — a `core:*` module never depends on a `feature:*` or on `app`.

```
app ──> feature:* ──> core:ui ──> core:designsystem
                 └──> core:data ──> core:datastore ──> core:model
                                                          └─> core:common
```

| Module | Purpose |
|--------|---------|
| `:app` | Shell only: `MainActivity`, `@HiltAndroidApp` Application, theme wiring, `NavHost`, the four-tab bottom navigation and the authentication gate. Owns no feature content |
| `:core:common` | Cross-cutting utilities. Holds the `@Dispatcher` qualifier and its module |
| `:core:model` | Pure Kotlin models (`User`, `AuthState`, `UserPreferences`, `DarkThemeMode`). No Android, Room or network annotations — that is what keeps the other layers free to map into it |
| `:core:data` | Repositories. The only layer features talk to. Holds the `AuthRepository` interface plus its network-free `LocalAuthRepository`, and `DefaultUserDataRepository` exposing settings as a `Flow<UserPreferences>` |
| `:core:datastore` | Proto-free Preferences DataStore (`MarsquakesPreferencesDataSource`) for the auth session and user settings |
| `:core:network` | Remote data: Retrofit `ApiService`, `NetworkAuthDataSource`, `RemoteAuthRepository` and the Hilt module that swaps the `AuthRepository` binding to the backend. Only present in the API-backed variant |
| `:core:designsystem` | Theme (`MarsquakesTheme`), colour and typography. The only place Material theming is configured; re-exports `material-icons-extended` so every feature can use any icon |
| `:core:ui` | Reusable composables shared by features (`LoadingWheel`, `MarsquakesTopAppBar`) |
| `build-logic` | Convention plugins. A separate included build, so editing it never invalidates the app build |

The shipped app has five feature modules: `login`, `home`, `search`, `notifications` and
`settings`. Each lives in its own `feature:*` module; new screens follow the same shape.

### Route / Screen split

Every feature exposes a **stateful `*Route`** that resolves the ViewModel and collects state,
and a **stateless `*Screen`** that takes a `UiState` plus lambdas and is therefore previewable
and testable without Hilt. Do not collapse the two.

### Navigation

A feature contributes its destinations through a `NavGraphBuilder` extension in its own
`navigation/` package (e.g. `loginScreen()`), and `app` only calls it. Adding a feature must
never require editing the body of the nav graph.

## Data Modes: API-backed vs Local

The same screen code runs in two data modes. The difference lives entirely in the
repository implementation that Hilt binds; ViewModels, `UiState`, Compose screens and the
`AuthState` contract never change.

| Aspect | Local mode (no backend) | API mode (requests the server) |
|--------|--------------------------|--------------------------------|
| Module present | `:core:data` only | `:core:data` + `:core:network` |
| `AuthRepository` binding | `LocalAuthRepository` (validates in memory, 800 ms fake delay) | `RemoteAuthRepository` (Retrofit `POST sys/login`) |
| Credentials | any non-empty username, password ≥ 6 chars | real credentials checked by the backend |
| Token | `mock-token-<uuid>`, unused | server JWT held by `AccessTokenHolder`, attached by `AccessTokenInterceptor` |
| Failure surface | local `IllegalArgumentException` messages | HTTP errors and `success=false` both surface as `IOException` carrying the server message |
| Runs offline | yes — fully usable with no network | no — login/session calls require the server |
| Persistence | DataStore session either way; a restart restores the signed-in state | identical DataStore session; the token is replayed to the interceptor on restart |

Why two modes at all: local mode keeps the app runnable, demoable and UI-testable before a
backend exists or when offline; API mode is what ships against the real service. Flipping
modes is one Hilt binding plus a module include — never a screen rewrite. When wiring a new
feature to the backend, keep the repository interface in `:core:data`, put the Retrofit
implementation in `:core:network`, and leave the screen depending on the interface only.

Loading/error behaviour is identical in both modes: every `*Route` collects a
`StateFlow<UiState>` and renders loading and error states from that state, so the UI does
not know which implementation produced it.

## Screen Catalog

Each row is one destination the app actually ships, with its module, route constant and
exact data source. "Local" data means constants or `MutableStateFlow` inside the app — no
network — while "DataStore" means persisted on-device preferences.

| Screen | Module / route constant | Contents | Data source |
|--------|--------------------------|----------|-------------|
| Login | `:feature:login` · `LOGIN_ROUTE` | Username/password form, loading spinner, inline error; success moves to the main scaffold | Repository via interface: `LocalAuthRepository` or `RemoteAuthRepository` depending on mode |
| Home (dashboard) | `:feature:home` · `HOME_ROUTE` | Greeting, banner `HorizontalPager` with page dots, three stat cards, four quick actions, recent-activity list | Greeting nickname from `AuthRepository.authState`; banners/stats/actions/activity are local constants |
| Search | `:feature:search` · `SEARCH_ROUTE` | Search bar; hot tags + history while empty; result list or empty state after submit | Entirely local: sample items filtered in the ViewModel; history is in-memory `MutableStateFlow` (not persisted) |
| Notifications | `:feature:notifications` · `NOTIFICATIONS_ROUTE` | All/System/Activity tabs, unread dots, notification cards | Local in-memory `NotificationsRepository` (`@Singleton`) seeded with sample notifications |
| Notification detail | `:feature:notifications` · `notification_detail_route/{notificationId}` | Full title, time and content; back arrow; "no longer exists" fallback | Same singleton repository, so read state is shared with the list |
| Settings | `:feature:settings` · `SETTINGS_ROUTE` | Account card; appearance dialog (theme + dynamic color); push/email switches; clear cache; version; terms; logout | Account/logout via `AuthRepository`; theme + dynamic color via `UserDataRepository` → DataStore; push/email switches and cache size are local, not persisted |

Notes for extending the catalog:

- Only **login** truly depends on a backend today, and even it has a local implementation.
  **Search, notifications and the body of home/settings are intentionally local sample data.**
- To convert a local screen to the API, add a method to a repository interface in
  `:core:data`, implement it with Retrofit in `:core:network`, expose a `Flow`/suspend call
  to the ViewModel, and leave the Compose screen untouched.
- The bottom navigation exposes four top-level destinations — Home, Search, Notifications,
  Settings — declared in `MarsquakesApp.kt`; notification detail is a pushed screen, not a
  tab, and login is shown only while `AuthState.SignedOut`.

## Build-logic Convention Plugins

`build-logic/convention` registers the plugins below. Modules apply them by id and must **not**
configure SDK levels, Java/Kotlin language levels or Compose by hand.

| Plugin id | Applied to | Pulls in |
|-----------|-----------|----------|
| `marsquakes.android.application` | `:app` | `com.android.application`, Kotlin Android, shared SDK/language config, test runner |
| `marsquakes.android.library` | every library | `com.android.library`, Kotlin Android, shared SDK/language config, JUnit |
| `marsquakes.android.library.compose` | Compose libraries | the library plugin plus Compose build feature and the Compose BOM |
| `marsquakes.android.feature` | `feature:*` | the Compose library plugin, Hilt, and the `core:*` UI stack |
| `marsquakes.android.hilt` | modules using DI | KSP + Hilt and the Hilt compiler |
| `marsquakes.android.room` | modules using Room | Room plugin + KSP, schema directory, Room runtime and compiler. Kept available for new modules even though the template ships no database |

Two rules keep this working:

- Plugin **versions** live in the root [build.gradle.kts](build.gradle.kts) as
  `alias(...) apply false`. A convention plugin applies the same plugins **by id** and so cannot
  carry a version of its own; removing a root `apply false` line breaks resolution in `build-logic`.
- The version catalog is shared with `build-logic` through
  `build-logic/settings.gradle.kts` (`versionCatalogs { create("libs") { from(files("../gradle/libs.versions.toml")) } }`),
  which is why `libs` is reachable from convention-plugin Kotlin source. Inside those sources a
  `Property<T>` needs `.set(...)` — the assignment overload used in build scripts is not
  available there.

## Directory Structure

```
apps/android/
├── app/                                 # Application shell module
│   └── src/main/java/cc/marsquakes/
├── core/
│   ├── common/                          # @Dispatcher qualifier, shared utilities
│   ├── model/                           # Pure Kotlin models
│   ├── data/                            # Repository interfaces + local implementations
│   ├── datastore/                       # Preferences DataStore
│   ├── network/                         # Retrofit, remote repository (API mode only)
│   ├── designsystem/                    # Theme, colour, typography
│   └── ui/                              # Shared composables
├── feature/
│   ├── login/                           # Sign-in screen
│   ├── home/                            # Dashboard
│   ├── search/                          # Search and discovery
│   ├── notifications/                   # Notification list and detail
│   └── settings/                        # Settings
├── build-logic/                         # Convention plugins (included build)
│   ├── settings.gradle.kts
│   └── convention/                      # Plugin implementations
├── gradle/
│   └── libs.versions.toml               # Dependency version catalog
├── build.gradle.kts                     # Root build configuration
├── settings.gradle.kts                  # Includes build-logic and every module
├── gradle.properties                    # Gradle properties
├── gradlew                              # Gradle Wrapper (Unix)
└── gradlew.bat                          # Gradle Wrapper (Windows)
```

## Coding Standards

- **Language**: Kotlin
- **UI Framework**: Jetpack Compose + Material 3
- **Dependency Injection**: Hilt. `@HiltViewModel` for ViewModels, `@Binds`/`@Provides` in a
  `di/` package inside the owning module
- **Code Style**: Follow Kotlin official coding standards
- **Commit Messages**: English only, conventional commits format
- **One module per capability**: add a `core:*` module for shared capability and a `feature:*`
  module for a screen; never put feature code in `:app`

## Package Identity

- **Source packages are fixed at `cc.marsquakes`** (`cc.marsquakes.core.*`,
  `cc.marsquakes.feature.*`, `cc.marsquakes.buildlogic`). Do not rename them per project.
- **`applicationId` is the only per-project value.** This template ships
  `applicationId = "cc.marsquakes"` so it builds as-is; when `mars create` scaffolds a new
  project, the CLI rewrites that single line to `cc.marsquakes.<code>`.
- Keeping `applicationId` separate from the source package means generated projects can be
  installed side by side on one device, and scaffolding never has to move directories or
  rewrite imports.
- `<code>` is an 8-character timestamp-derived base-36 segment: a fixed `a` prefix (a JVM
  segment cannot start with a digit), 3 base-36 chars taken from the millisecond timestamp,
  and 4 random base-36 chars to break same-millisecond ties. It is short and effectively
  collision-free without exposing the project name.

## Build Commands

Run from the `apps/android/` directory.

**macOS / Linux**

```bash
./gradlew assembleDebug      # Build Debug APK
./gradlew assembleRelease    # Build Release APK
./gradlew test               # Unit tests
./gradlew connectedAndroidTest
./gradlew clean
```

**Windows (PowerShell)**

```powershell
.\gradlew.bat assembleDebug
.\gradlew.bat assembleRelease
.\gradlew.bat test
.\gradlew.bat connectedAndroidTest
.\gradlew.bat clean
```

Prefix any launch with a JDK 17+ `JAVA_HOME`; Android Studio's bundled JBR is the usual choice.

**macOS / Linux**

```bash
JAVA_HOME=/Applications/Android\ Studio.app/Contents/jbr/Contents/Home ./gradlew assembleDebug
```

**Windows (PowerShell)**

```powershell
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"; .\gradlew.bat assembleDebug
```

## Notes

- Compose BOM is managed uniformly through `libs.versions.toml`
- Only `google()` and `mavenCentral()` are allowed as dependency repositories, project-level repositories are prohibited
- Build artifact directory `build/` has been added to `.gitignore`, do not commit it
- **AndroidX versions are pinned to the compileSdk-36 era on purpose.** AGP 8.13.2 supports at
  most `compileSdk 36`, so a dependency whose AAR metadata demands API 37 / AGP 9.x fails
  `:app:checkDebugAarMetadata` with an error that names the library rather than the constraint.
  When bumping `coreKtx`, `lifecycle`, `activityCompose` or `navigationCompose`, bump the AGP and
  `compileSdk` (`build-logic/.../AndroidSdk.kt`) in the same change, or not at all
