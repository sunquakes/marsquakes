plugins {
    alias(libs.plugins.marsquakes.android.library)
    alias(libs.plugins.marsquakes.android.hilt)
    alias(libs.plugins.kotlin.serialization)
}

android {
    namespace = "com.sunquakes.marsquakes.core.network"
}

dependencies {
    implementation(project(":core:common"))
    implementation(project(":core:model"))

    // Exposed as `api` on purpose: consumers identify network failures by catching
    // `retrofit2.HttpException`, so the type has to be on their compile classpath.
    api(libs.retrofit)
    implementation(libs.retrofit.kotlinx.serialization)
    implementation(platform(libs.okhttp.bom))
    implementation(libs.okhttp)
    implementation(libs.okhttp.logging)
    implementation(libs.kotlinx.serialization.json)
    implementation(libs.kotlinx.coroutines.android)
}
