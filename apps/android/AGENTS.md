# Android - AGENTS.md

## Module Overview

- **Package Name**: `com.sunquakes.marsquakes`
- **Tech Stack**: Android / Kotlin / Jetpack Compose
- **minSdk**: 33 / **targetSdk**: 36 / **compileSdk**: 36
- **Build Tool**: Gradle 8.13 (Kotlin DSL)
- **JVM Target**: Java 11
- **Version**: 1.0 (versionCode: 1)

## Directory Structure

```
apps/android/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/sunquakes/marsquakes/   # Main source code
│   │   │   └── res/                             # Android resources
│   │   ├── test/                                # Unit tests
│   │   └── androidTest/                         # Instrumented tests
│   ├── build.gradle.kts                         # App module build configuration
│   └── proguard-rules.pro                       # ProGuard rules
├── gradle/
│   └── libs.versions.toml                       # Dependency version catalog
├── build.gradle.kts                             # Root build configuration
├── settings.gradle.kts                          # Project settings
├── gradle.properties                            # Gradle properties
├── gradlew                                      # Gradle Wrapper (Unix)
└── gradlew.bat                                  # Gradle Wrapper (Windows)
```

## Coding Standards

- **Language**: Kotlin
- **UI Framework**: Jetpack Compose + Material 3
- **Code Style**: Follow Kotlin official coding standards
- **Commit Messages**: Use concise Chinese or English descriptions

## Build Commands

```bash
# Execute in apps/android/ directory

# Build Debug version
./gradlew assembleDebug

# Build Release version
./gradlew assembleRelease

# Run unit tests
./gradlew test

# Run instrumented tests
./gradlew connectedAndroidTest

# Clean build artifacts
./gradlew clean
```

## Notes

- Compose BOM is managed uniformly through `libs.versions.toml`
- Only `google()` and `mavenCentral()` are allowed as dependency repositories, project-level repositories are prohibited
- Build artifact directory `build/` has been added to `.gitignore`, do not commit it