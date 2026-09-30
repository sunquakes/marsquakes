import org.jetbrains.kotlin.gradle.dsl.JvmTarget

plugins {
    `kotlin-dsl`
}

group = "cc.marsquakes.buildlogic"

java {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
}

kotlin {
    compilerOptions {
        jvmTarget = JvmTarget.JVM_17
    }
}

dependencies {
    compileOnly(libs.android.gradlePlugin)
    compileOnly(libs.kotlin.gradlePlugin)
    compileOnly(libs.ksp.gradlePlugin)
    compileOnly(libs.room.gradlePlugin)
}

gradlePlugin {
    plugins {
        register("androidApplication") {
            id = "marsquakes.android.application"
            implementationClass = "cc.marsquakes.buildlogic.AndroidApplicationConventionPlugin"
        }
        register("androidLibrary") {
            id = "marsquakes.android.library"
            implementationClass = "cc.marsquakes.buildlogic.AndroidLibraryConventionPlugin"
        }
        register("androidLibraryCompose") {
            id = "marsquakes.android.library.compose"
            implementationClass = "cc.marsquakes.buildlogic.AndroidLibraryComposeConventionPlugin"
        }
        register("androidFeature") {
            id = "marsquakes.android.feature"
            implementationClass = "cc.marsquakes.buildlogic.AndroidFeatureConventionPlugin"
        }
        register("androidHilt") {
            id = "marsquakes.android.hilt"
            implementationClass = "cc.marsquakes.buildlogic.AndroidHiltConventionPlugin"
        }
        register("androidRoom") {
            id = "marsquakes.android.room"
            implementationClass = "cc.marsquakes.buildlogic.AndroidRoomConventionPlugin"
        }
    }
}
