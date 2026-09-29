plugins {
    alias(libs.plugins.marsquakes.android.library)
    alias(libs.plugins.marsquakes.android.hilt)
}

android {
    namespace = "com.sunquakes.marsquakes.core.datastore"
}

dependencies {
    implementation(project(":core:model"))
    implementation(libs.androidx.datastore.preferences)
    implementation(libs.kotlinx.coroutines.android)
}
