package cc.marsquakes.feature.profile.navigation

import androidx.navigation.NavController
import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavOptions
import androidx.navigation.compose.composable
import cc.marsquakes.feature.profile.ProfileRoute

const val PROFILE_ROUTE = "profile_route"

fun NavController.navigateToProfile(navOptions: NavOptions? = null) {
    navigate(PROFILE_ROUTE, navOptions)
}

fun NavGraphBuilder.profileScreen() {
    composable(route = PROFILE_ROUTE) {
        ProfileRoute()
    }
}
