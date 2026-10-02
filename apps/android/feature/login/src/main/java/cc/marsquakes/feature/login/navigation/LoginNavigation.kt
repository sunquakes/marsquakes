package cc.marsquakes.feature.login.navigation

import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.composable
import cc.marsquakes.feature.login.LoginRoute
import kotlinx.serialization.Serializable

@Serializable
data object LoginDestination

fun NavGraphBuilder.loginScreen() {
    composable<LoginDestination> {
        LoginRoute()
    }
}
