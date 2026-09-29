package com.sunquakes.marsquakes.buildlogic

import com.android.build.api.dsl.CommonExtension
import org.gradle.api.JavaVersion
import org.gradle.api.Project
import org.gradle.kotlin.dsl.configure
import org.jetbrains.kotlin.gradle.dsl.JvmTarget
import org.jetbrains.kotlin.gradle.dsl.KotlinAndroidProjectExtension

/**
 * Applies the settings every Android module in this build shares: compile/min SDK levels,
 * Java/Kotlin language level and the Kotlin compiler options.
 *
 * The signature is deliberately the star-projected [CommonExtension] so the same function
 * serves both `com.android.application` and `com.android.library` modules — the type
 * parameters are bounded by the concrete DSL interfaces, so `compileSdk`, `defaultConfig`
 * and `compileOptions` stay accessible through the projection.
 */
internal fun Project.configureKotlinAndroid(
    commonExtension: CommonExtension<*, *, *, *, *, *>,
) {
    commonExtension.apply {
        compileSdk {
            version = release(COMPILE_SDK)
        }

        defaultConfig {
            minSdk = MIN_SDK
        }

        compileOptions {
            sourceCompatibility = JavaVersion.VERSION_11
            targetCompatibility = JavaVersion.VERSION_11
        }
    }

    extensions.configure<KotlinAndroidProjectExtension> {
        compilerOptions {
            jvmTarget.set(JvmTarget.JVM_11)
        }
    }
}
