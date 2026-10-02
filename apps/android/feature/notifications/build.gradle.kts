plugins {
    alias(libs.plugins.marsquakes.android.feature)
}

android {
    namespace = "cc.marsquakes.feature.notifications"
}

dependencies {
    implementation(project(":core:data"))
}
