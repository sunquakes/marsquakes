plugins {
    alias(libs.plugins.marsquakes.android.feature)
}

android {
    namespace = "cc.marsquakes.feature.home"
}

dependencies {
    implementation(project(":core:data"))
}
