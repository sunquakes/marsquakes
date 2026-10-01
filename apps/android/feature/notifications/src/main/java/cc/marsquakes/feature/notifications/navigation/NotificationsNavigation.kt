package cc.marsquakes.feature.notifications.navigation

import androidx.navigation.NavController
import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavOptions
import androidx.navigation.NavType
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import cc.marsquakes.feature.notifications.NotificationDetailRoute
import cc.marsquakes.feature.notifications.NotificationsRoute

const val NOTIFICATIONS_ROUTE = "notifications_route"
private const val NOTIFICATION_ID_ARG = "notificationId"
private const val NOTIFICATION_DETAIL_ROUTE = "notification_detail_route/{$NOTIFICATION_ID_ARG}"

fun NavController.navigateToNotifications(navOptions: NavOptions? = null) {
    navigate(NOTIFICATIONS_ROUTE, navOptions)
}

fun NavController.navigateToNotificationDetail(
    notificationId: String,
    navOptions: NavOptions? = null,
) {
    navigate(
        route = "notification_detail_route/$notificationId",
        navOptions = navOptions,
    )
}

fun NavGraphBuilder.notificationsScreen(
    onNotificationClick: (String) -> Unit,
    onBack: () -> Unit,
) {
    composable(route = NOTIFICATIONS_ROUTE) {
        NotificationsRoute(onNotificationClick = onNotificationClick)
    }
    composable(
        route = NOTIFICATION_DETAIL_ROUTE,
        arguments = listOf(
            navArgument(NOTIFICATION_ID_ARG) { type = NavType.StringType },
        ),
    ) { backStackEntry ->
        val notificationId = backStackEntry.arguments
            ?.getString(NOTIFICATION_ID_ARG)
            .orEmpty()
        NotificationDetailRoute(
            notificationId = notificationId,
            onBack = onBack,
        )
    }
}
