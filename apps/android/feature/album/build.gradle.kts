plugins {
    alias(libs.plugins.marsquakes.android.feature)
}

android {
    namespace = "com.sunquakes.marsquakes.feature.album"
}

dependencies {
    implementation(project(":core:data"))
}
