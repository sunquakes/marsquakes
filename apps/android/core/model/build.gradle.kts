plugins {
    alias(libs.plugins.marsquakes.android.library)
}

android {
    namespace = "com.sunquakes.marsquakes.core.model"
}

dependencies {
    implementation(libs.kotlinx.coroutines.android)
}
