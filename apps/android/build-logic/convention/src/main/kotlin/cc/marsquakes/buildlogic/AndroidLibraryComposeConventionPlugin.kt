package cc.marsquakes.buildlogic

import com.android.build.api.dsl.LibraryExtension
import org.gradle.api.Plugin
import org.gradle.api.Project
import org.gradle.kotlin.dsl.getByType

/**
 * Convention plugin for Android libraries that render Compose UI.
 *
 * Layering: this plugin builds on [AndroidLibraryConventionPlugin] rather than repeating it,
 * so a module applies exactly one Compose-flavoured plugin and inherits the shared SDK and
 * language-level configuration.
 */
class AndroidLibraryComposeConventionPlugin : Plugin<Project> {
    override fun apply(target: Project) {
        with(target) {
            with(pluginManager) {
                apply("marsquakes.android.library")
                apply("org.jetbrains.kotlin.plugin.compose")
            }

            configureAndroidCompose(extensions.getByType<LibraryExtension>())
        }
    }
}
