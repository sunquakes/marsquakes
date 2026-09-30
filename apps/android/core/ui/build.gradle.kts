plugins {
    alias(libs.plugins.marsquakes.android.library.compose)
}

android {
    namespace = "cc.marsquakes.core.ui"
}

dependencies {
    api(project(":core:designsystem"))

    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.lifecycle.runtime.compose)
    implementation(libs.kotlinx.coroutines.android)
}
