# Android - AGENTS.md

This file holds the **Android-specific** rules and inherits the root
[AGENTS.md](../../AGENTS.md). Where the two ever disagree, the root wins.

## Module Overview

- **Application ID / Namespace**: `com.sunquakes.marsquakes`
- **Tech Stack**: Android / Kotlin / Jetpack Compose / Hilt / Room / Retrofit + OkHttp / DataStore
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
                 └──> core:data ──> core:database / core:datastore / core:network ──> core:model
                                                                                 └─> core:common
```

| Module | Purpose |
|--------|---------|
| `:app` | Shell only: `MainActivity`, `@HiltAndroidApp` Application, theme wiring, `NavHost` and the top app bar. Owns no screen content |
| `:feature:album` | The album feature: `AlbumRoute` (stateful) + `AlbumScreen` (stateless) + `AlbumViewModel`, and its own `navigation/` graph extension |
| `:core:common` | Cross-cutting utilities. Holds the `@Dispatcher` qualifier and its module |
| `:core:model` | Pure Kotlin models (`Album`, `UserPreferences`). No Android, Room or Retrofit annotations — that is what keeps the other layers free to map into it |
| `:core:data` | Repositories. The only layer features talk to. `OfflineFirstAlbumRepository` keeps the DB as the source of truth and treats the network as a refresh |
| `:core:database` | Room: `MarsquakesDatabase`, entities, DAOs, `schemaDirectory("$projectDir/schemas")` |
| `:core:datastore` | Proto-free Preferences DataStore (`MarsquakesPreferencesDataSource`) for user settings |
| `:core:network` | Retrofit + OkHttp + kotlinx-serialization. DTOs live here and are mapped to `core:model` types |
| `:core:designsystem` | Theme (`MarsquakesTheme`), colour and typography. The only place Material theming is configured |
| `:core:ui` | Reusable composables shared by features (`LoadingWheel`, `MarsquakesTopAppBar`) |
| `build-logic` | Convention plugins. A separate included build, so editing it never invalidates the app build |

### Route / Screen split

Every feature exposes a **stateful `*Route`** that resolves the ViewModel and collects state,
and a **stateless `*Screen`** that takes a `UiState` plus lambdas and is therefore previewable
and testable without Hilt. Do not collapse the two.

### Navigation

A feature contributes its destinations through a `NavGraphBuilder` extension in its own
`navigation/` package (e.g. `albumScreen()`), and `app` only calls it. Adding a feature must
never require editing the body of the nav graph.

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
| `marsquakes.android.room` | `:core:database` | Room plugin + KSP, schema directory, Room runtime and compiler |

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
│   └── src/main/java/com/sunquakes/marsquakes/
├── core/
│   ├── common/                          # @Dispatcher qualifier, shared utilities
│   ├── model/                           # Pure Kotlin models
│   ├── data/                            # Repositories (offline-first)
│   ├── database/                        # Room database, entities, DAOs, schemas
│   ├── datastore/                       # Preferences DataStore
│   ├── network/                         # Retrofit API, DTOs, OkHttp
│   ├── designsystem/                    # Theme, colour, typography
│   └── ui/                              # Shared composables
├── feature/
│   └── album/                           # Album screen, ViewModel, nav graph
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
