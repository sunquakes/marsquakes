package cc.marsquakes.feature.search.navigation

import androidx.navigation.NavController
import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavOptions
import androidx.navigation.compose.composable
import cc.marsquakes.feature.search.SearchRoute

const val SEARCH_ROUTE = "search_route"

fun NavController.navigateToSearch(navOptions: NavOptions? = null) {
    navigate(SEARCH_ROUTE, navOptions)
}

fun NavGraphBuilder.searchScreen() {
    composable(route = SEARCH_ROUTE) {
        SearchRoute()
    }
}
