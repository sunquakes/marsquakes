package cc.marsquakes.feature.settings.navigation

import androidx.navigation.NavController
import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavOptions
import androidx.navigation.compose.composable
import cc.marsquakes.feature.settings.SettingsRoute
import kotlinx.serialization.Serializable

@Serializable
data object SettingsDestination

fun NavController.navigateToSettings(navOptions: NavOptions? = null) {
    navigate(SettingsDestination, navOptions)
}

fun NavGraphBuilder.settingsScreen() {
    composable<SettingsDestination> {
        SettingsRoute()
    }
}
