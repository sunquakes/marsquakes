import java.util.Properties

val defaultApiBaseUrl = "http://10.0.2.2:8817/marsquakes-api/"

plugins {
    alias(libs.plugins.marsquakes.android.library)
    alias(libs.plugins.marsquakes.android.hilt)
    alias(libs.plugins.kotlin.serialization)
}

android {
    namespace = "cc.marsquakes.core.network"

    buildFeatures {
        buildConfig = true
    }

    val localProperties = Properties()
    val localPropertiesFile = rootProject.file("local.properties")
    if (localPropertiesFile.exists()) {
        localPropertiesFile.inputStream().use { localProperties.load(it) }
    }
    val apiBaseUrl = localProperties.getProperty("MARSQUAKES_API_BASE_URL")
        ?: defaultApiBaseUrl

    defaultConfig {
        buildConfigField("String", "API_BASE_URL", "\"$apiBaseUrl\"")
    }
}

dependencies {
    implementation(project(":core:common"))
    implementation(project(":core:model"))
    implementation(project(":core:datastore"))
    implementation(project(":core:data"))

    implementation(libs.retrofit)
    implementation(libs.retrofit.kotlinx.serialization)
    implementation(libs.kotlinx.serialization.json)
    implementation(libs.kotlinx.coroutines.android)

    implementation(platform(libs.okhttp.bom))
    implementation(libs.okhttp)
    implementation(libs.okhttp.logging)
}
