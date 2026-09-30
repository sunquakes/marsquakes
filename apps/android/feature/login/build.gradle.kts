plugins {
    alias(libs.plugins.marsquakes.android.feature)
}

android {
    namespace = "cc.marsquakes.feature.login"
}

dependencies {
    implementation(project(":core:data"))
}
