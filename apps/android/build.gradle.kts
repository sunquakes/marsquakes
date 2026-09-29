// Top-level build file where you can add configuration options common to all sub-projects/modules.
//
// Every plugin used by any module is declared here with `apply false`. That is what makes the
// plugin *versions* resolvable from the convention plugins in `build-logic`, which apply the
// same plugins by id and therefore cannot carry a version of their own.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.android.library) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
    alias(libs.plugins.kotlin.serialization) apply false
    alias(libs.plugins.ksp) apply false
    alias(libs.plugins.hilt) apply false
    alias(libs.plugins.room) apply false
}
