plugins {
    alias(libs.plugins.marsquakes.android.feature)
}

android {
    namespace = "cc.marsquakes.feature.search"
}

dependencies {
    implementation(project(":core:data"))
}
