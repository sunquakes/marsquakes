package cc.marsquakes.feature.notifications.navigation

import androidx.navigation.NavController
import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavOptions
import androidx.navigation.compose.composable
import androidx.navigation.toRoute
import cc.marsquakes.feature.notifications.NotificationDetailRoute
import cc.marsquakes.feature.notifications.NotificationsRoute
import kotlinx.serialization.Serializable

@Serializable
data object NotificationsDestination

@Serializable
data class NotificationDetailDestination(
    val notificationId: String,
)

fun NavController.navigateToNotifications(navOptions: NavOptions? = null) {
    navigate(NotificationsDestination, navOptions)
}

fun NavController.navigateToNotificationDetail(
    notificationId: String,
    navOptions: NavOptions? = null,
) {
    navigate(
        route = NotificationDetailDestination(notificationId = notificationId),
        navOptions = navOptions,
    )
}

fun NavGraphBuilder.notificationsScreen(
    onNotificationClick: (String) -> Unit,
    onBack: () -> Unit,
) {
    composable<NotificationsDestination> {
        NotificationsRoute(onNotificationClick = onNotificationClick)
    }
    composable<NotificationDetailDestination> { backStackEntry ->
        val destination = backStackEntry.toRoute<NotificationDetailDestination>()
        NotificationDetailRoute(
            notificationId = destination.notificationId,
            onBack = onBack,
        )
    }
}
