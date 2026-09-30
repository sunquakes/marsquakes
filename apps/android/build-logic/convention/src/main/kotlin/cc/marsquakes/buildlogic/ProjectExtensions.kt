package cc.marsquakes.buildlogic

import org.gradle.api.Project
import org.gradle.api.artifacts.VersionCatalog
import org.gradle.api.artifacts.VersionCatalogsExtension
import org.gradle.kotlin.dsl.getByType

/**
 * The `libs` version catalog, re-exported for use inside convention plugins.
 *
 * `build-logic/settings.gradle.kts` points this catalog at the app build's
 * `gradle/libs.versions.toml`, so both builds resolve the exact same versions.
 */
internal val Project.libs: VersionCatalog
    get() = extensions.getByType<VersionCatalogsExtension>().named("libs")
