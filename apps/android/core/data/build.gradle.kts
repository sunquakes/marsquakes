plugins {
    alias(libs.plugins.marsquakes.android.library)
    alias(libs.plugins.marsquakes.android.hilt)
}

android {
    namespace = "cc.marsquakes.core.data"
}

dependencies {
    implementation(project(":core:common"))
    implementation(project(":core:model"))
    implementation(project(":core:datastore"))

    implementation(libs.kotlinx.coroutines.android)
}
