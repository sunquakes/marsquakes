plugins {
    alias(libs.plugins.marsquakes.android.library)
    alias(libs.plugins.marsquakes.android.hilt)
}

android {
    namespace = "cc.marsquakes.core.common"
}

dependencies {
    implementation(libs.kotlinx.coroutines.android)
}
