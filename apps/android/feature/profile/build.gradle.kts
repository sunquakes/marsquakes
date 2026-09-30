plugins {
    alias(libs.plugins.marsquakes.android.feature)
}

android {
    namespace = "cc.marsquakes.feature.profile"
}

dependencies {
    implementation(project(":core:data"))
}
