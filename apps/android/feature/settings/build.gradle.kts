plugins {
    alias(libs.plugins.marsquakes.android.feature)
}

android {
    namespace = "cc.marsquakes.feature.settings"
}

dependencies {
    implementation(project(":core:data"))
}
