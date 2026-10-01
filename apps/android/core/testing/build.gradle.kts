plugins {
    alias(libs.plugins.marsquakes.android.library)
}

android {
    namespace = "cc.marsquakes.core.testing"
}

dependencies {
    api(project(":core:common"))
    api(project(":core:model"))
    api(project(":core:data"))

    api(libs.junit)
    api(libs.kotlinx.coroutines.test)
    api(libs.turbine)
}
