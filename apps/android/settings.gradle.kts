pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\.android.*")
                includeGroupByRegex("com\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "Marsquakes"

// Convention plugins live in their own build so the app build stays free of buildSrc
// recompilation on every change.
includeBuild("build-logic")

include(":app")

include(":core:common")
include(":core:model")
include(":core:data")
include(":core:datastore")
include(":core:designsystem")
include(":core:ui")
include(":core:network")
include(":core:testing")

include(":feature:home")
include(":feature:login")
include(":feature:search")
include(":feature:notifications")
include(":feature:settings")
