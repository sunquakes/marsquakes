# Android - AGENTS.md

## 模块概览

- **包名**: `com.sunquakes.marsquakes`
- **技术栈**: Android / Kotlin / Jetpack Compose
- **minSdk**: 33 / **targetSdk**: 36 / **compileSdk**: 36
- **构建工具**: Gradle 8.13 (Kotlin DSL)
- **JVM 目标**: Java 11
- **版本**: 1.0 (versionCode: 1)

## 目录结构

```
apps/android/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/sunquakes/marsquakes/   # 主要源码
│   │   │   └── res/                             # Android 资源
│   │   ├── test/                                # 单元测试
│   │   └── androidTest/                         # 仪器化测试
│   ├── build.gradle.kts                         # app 模块构建配置
│   └── proguard-rules.pro                       # 混淆规则
├── gradle/
│   └── libs.versions.toml                       # 依赖版本目录
├── build.gradle.kts                             # 根级构建配置
├── settings.gradle.kts                          # 项目设置
├── gradle.properties                            # Gradle 属性
├── gradlew                                      # Gradle Wrapper (Unix)
└── gradlew.bat                                  # Gradle Wrapper (Windows)
```

## 编码规范

- **语言**: Kotlin
- **UI 框架**: Jetpack Compose + Material 3
- **代码风格**: 遵循 Kotlin 官方编码规范
- **提交信息**: 使用简洁明确的中文或英文描述

## 构建命令

```bash
# 在 apps/android/ 目录下执行

# 构建 Debug 版本
./gradlew assembleDebug

# 构建 Release 版本
./gradlew assembleRelease

# 运行单元测试
./gradlew test

# 运行仪器化测试
./gradlew connectedAndroidTest

# 清理构建产物
./gradlew clean
```

## 注意事项

- Compose BOM 通过 `libs.versions.toml` 统一管理版本
- 依赖仓库仅允许 `google()` 和 `mavenCentral()`，禁止使用项目级仓库
- 构建产物目录 `build/` 已加入 `.gitignore`，请勿提交