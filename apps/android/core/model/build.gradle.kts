plugins {
    alias(libs.plugins.marsquakes.android.library)
}

android {
    namespace = "cc.marsquakes.core.model"
}

dependencies {
    implementation(libs.kotlinx.coroutines.android)
}
