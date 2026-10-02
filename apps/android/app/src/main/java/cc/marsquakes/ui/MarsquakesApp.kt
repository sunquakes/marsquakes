package cc.marsquakes.ui

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import kotlin.reflect.KClass
import androidx.compose.ui.res.stringResource
import androidx.navigation.NavDestination.Companion.hasRoute
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
import cc.marsquakes.feature.home.navigation.HomeDestination
import cc.marsquakes.feature.home.navigation.homeScreen
import cc.marsquakes.feature.login.navigation.LoginDestination
import cc.marsquakes.feature.login.navigation.loginScreen
import cc.marsquakes.feature.notifications.navigation.NotificationDetailDestination
import cc.marsquakes.feature.notifications.navigation.NotificationsDestination
import cc.marsquakes.feature.notifications.navigation.notificationsScreen
import cc.marsquakes.feature.search.navigation.SearchDestination
import cc.marsquakes.feature.search.navigation.searchScreen
import cc.marsquakes.feature.settings.navigation.SettingsDestination
import cc.marsquakes.feature.settings.navigation.settingsScreen
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
                    startDestination = LoginDestination,
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
                        ?.any { it.hasRoute(destination.route) } == true
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
            startDestination = HomeDestination,
            modifier = Modifier.padding(innerPadding),
        ) {
            homeScreen()
            searchScreen()
            notificationsScreen(
                onNotificationClick = { id ->
                    navController.navigate(NotificationDetailDestination(notificationId = id))
                },
                onBack = { navController.popBackStack() },
            )
            settingsScreen()
        }
    }
}

private enum class TopLevelDestination(
    val route: KClass<*>,
    val icon: ImageVector,
    val labelRes: Int,
) {
    HOME(
        route = HomeDestination::class,
        icon = Icons.Filled.Home,
        labelRes = R.string.nav_home,
    ),
    SEARCH(
        route = SearchDestination::class,
        icon = Icons.Filled.Search,
        labelRes = R.string.nav_search,
    ),
    NOTIFICATIONS(
        route = NotificationsDestination::class,
        icon = Icons.Filled.Notifications,
        labelRes = R.string.nav_notifications,
    ),
    SETTINGS(
        route = SettingsDestination::class,
        icon = Icons.Filled.Settings,
        labelRes = R.string.nav_settings,
    ),
}
