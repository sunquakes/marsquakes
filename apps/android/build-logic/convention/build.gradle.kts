import org.jetbrains.kotlin.gradle.dsl.JvmTarget

plugins {
    `kotlin-dsl`
}

group = "com.sunquakes.marsquakes.buildlogic"

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
            implementationClass = "com.sunquakes.marsquakes.buildlogic.AndroidApplicationConventionPlugin"
        }
        register("androidLibrary") {
            id = "marsquakes.android.library"
            implementationClass = "com.sunquakes.marsquakes.buildlogic.AndroidLibraryConventionPlugin"
        }
        register("androidLibraryCompose") {
            id = "marsquakes.android.library.compose"
            implementationClass = "com.sunquakes.marsquakes.buildlogic.AndroidLibraryComposeConventionPlugin"
        }
        register("androidFeature") {
            id = "marsquakes.android.feature"
            implementationClass = "com.sunquakes.marsquakes.buildlogic.AndroidFeatureConventionPlugin"
        }
        register("androidHilt") {
            id = "marsquakes.android.hilt"
            implementationClass = "com.sunquakes.marsquakes.buildlogic.AndroidHiltConventionPlugin"
        }
        register("androidRoom") {
            id = "marsquakes.android.room"
            implementationClass = "com.sunquakes.marsquakes.buildlogic.AndroidRoomConventionPlugin"
        }
    }
}
