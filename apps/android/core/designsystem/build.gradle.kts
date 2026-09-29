plugins {
    alias(libs.plugins.marsquakes.android.library.compose)
}

android {
    namespace = "com.sunquakes.marsquakes.core.designsystem"
}

dependencies {
    api(project(":core:model"))

    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.material3)
}
