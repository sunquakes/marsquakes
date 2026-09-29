plugins {
    alias(libs.plugins.marsquakes.android.library)
    alias(libs.plugins.marsquakes.android.hilt)
    alias(libs.plugins.marsquakes.android.room)
}

android {
    namespace = "com.sunquakes.marsquakes.core.database"
}

dependencies {
    implementation(project(":core:model"))
    implementation(libs.kotlinx.coroutines.android)
}
