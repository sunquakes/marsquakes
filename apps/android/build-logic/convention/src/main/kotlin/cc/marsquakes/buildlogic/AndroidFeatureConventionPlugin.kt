package cc.marsquakes.buildlogic

import org.gradle.api.Plugin
import org.gradle.api.Project
import org.gradle.kotlin.dsl.dependencies

/**
 * Convention plugin for `feature:*` modules.
 *
 * A feature is a Compose library with Hilt, and it gets the shared UI stack so every feature
 * screen can be built from the same building blocks. The `core:*` dependencies are declared
 * here on purpose: a feature that cannot reach `core:ui` / `core:designsystem` would be
 * forced to re-implement them, which is exactly what the module split is meant to prevent.
 */
class AndroidFeatureConventionPlugin : Plugin<Project> {
    override fun apply(target: Project) {
        with(target) {
            with(pluginManager) {
                apply("marsquakes.android.library.compose")
                apply("marsquakes.android.hilt")
                apply("org.jetbrains.kotlin.plugin.serialization")
            }

            dependencies {
                "implementation"(project(":core:common"))
                "implementation"(project(":core:model"))
                "implementation"(project(":core:ui"))
                "implementation"(project(":core:designsystem"))

                "implementation"(libs.findLibrary("androidx-lifecycle-runtime-compose").get())
                "implementation"(libs.findLibrary("androidx-lifecycle-viewmodel-compose").get())
                "implementation"(libs.findLibrary("androidx-navigation-compose").get())
                "implementation"(libs.findLibrary("androidx-hilt-navigation-compose").get())
                "implementation"(libs.findLibrary("androidx-compose-material3").get())
                "implementation"(libs.findLibrary("kotlinx-coroutines-android").get())
                "implementation"(libs.findLibrary("kotlinx-serialization-json").get())

                "testImplementation"(project(":core:testing"))

                "androidTestImplementation"(libs.findLibrary("androidx-compose-ui-test-junit4").get())
                "debugImplementation"(libs.findLibrary("androidx-compose-ui-test-manifest").get())
            }
        }
    }
}
