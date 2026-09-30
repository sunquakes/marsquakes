package cc.marsquakes.ui

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import cc.marsquakes.R
import cc.marsquakes.core.designsystem.theme.MarsquakesTheme
import cc.marsquakes.core.model.AuthState
import cc.marsquakes.core.model.DarkThemeMode
import cc.marsquakes.core.ui.component.LoadingWheel
import cc.marsquakes.feature.home.navigation.HOME_ROUTE
import cc.marsquakes.feature.home.navigation.homeScreen
import cc.marsquakes.feature.login.navigation.LOGIN_ROUTE
import cc.marsquakes.feature.login.navigation.loginScreen
import cc.marsquakes.feature.profile.navigation.PROFILE_ROUTE
import cc.marsquakes.feature.profile.navigation.profileScreen
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle

/**
 * The application shell: theme, the authentication gate and the main navigation scaffold.
 *
 * It deliberately owns no screen content. Features are reached through
 * [androidx.navigation.NavGraphBuilder] extensions they each expose, and the only decision the
 * shell makes is which navigation graph the current [AuthState] allows.
 */
@Composable
fun MarsquakesApp(viewModel: AppViewModel = hiltViewModel()) {
    val userPreferences by viewModel.userPreferences.collectAsStateWithLifecycle()
    val authState by viewModel.authState.collectAsStateWithLifecycle()

    MarsquakesTheme(
        darkTheme = when (userPreferences.darkThemeMode) {
            DarkThemeMode.SYSTEM -> isSystemInDarkTheme()
            DarkThemeMode.LIGHT -> false
            DarkThemeMode.DARK -> true
        },
        dynamicColor = userPreferences.dynamicColor,
    ) {
        when (val state = authState) {
            AuthState.Loading -> LoadingWheel()

            AuthState.SignedOut -> {
                val navController = rememberNavController()
                NavHost(
                    navController = navController,
                    startDestination = LOGIN_ROUTE,
                ) {
                    loginScreen()
                }
            }

            is AuthState.SignedIn -> MainScaffold()
        }
    }
}

@Composable
private fun MainScaffold() {
    val navController = rememberNavController()
    val destinations = TopLevelDestination.entries

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        bottomBar = {
            NavigationBar {
                val backStackEntry by navController.currentBackStackEntryAsState()
                val currentDestination = backStackEntry?.destination
                destinations.forEach { destination ->
                    val isSelected = currentDestination?.hierarchy
                        ?.any { it.route == destination.route } == true
                    NavigationBarItem(
                        selected = isSelected,
                        onClick = {
                            navController.navigate(destination.route) {
                                popUpTo(navController.graph.findStartDestination().id) {
                                    saveState = true
                                }
                                launchSingleTop = true
                                restoreState = true
                            }
                        },
                        icon = {
                            Icon(
                                imageVector = destination.icon,
                                contentDescription = null,
                            )
                        },
                        label = { Text(text = stringResource(id = destination.labelRes)) },
                    )
                }
            }
        },
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = HOME_ROUTE,
            modifier = Modifier.padding(innerPadding),
        ) {
            homeScreen()
            profileScreen()
        }
    }
}

private enum class TopLevelDestination(
    val route: String,
    val icon: ImageVector,
    val labelRes: Int,
) {
    HOME(
        route = HOME_ROUTE,
        icon = Icons.Filled.Home,
        labelRes = R.string.nav_home,
    ),
    PROFILE(
        route = PROFILE_ROUTE,
        icon = Icons.Filled.Person,
        labelRes = R.string.nav_profile,
    ),
}
