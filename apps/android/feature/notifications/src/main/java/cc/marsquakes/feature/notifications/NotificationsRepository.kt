package cc.marsquakes.feature.notifications

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import javax.inject.Inject
import javax.inject.Singleton

enum class NotificationType {
    SYSTEM,
    ACTIVITY,
}

data class AppNotification(
    val id: String,
    val title: String,
    val content: String,
    val time: String,
    val type: NotificationType,
    val unread: Boolean,
)

@Singleton
class NotificationsRepository @Inject constructor() {

    private val _notifications = MutableStateFlow(SAMPLE_NOTIFICATIONS)
    val notifications: StateFlow<List<AppNotification>> = _notifications.asStateFlow()

    fun markAsRead(id: String) {
        _notifications.update { list ->
            list.map { notification ->
                if (notification.id == id) notification.copy(unread = false) else notification
            }
        }
    }
}

private val SAMPLE_NOTIFICATIONS = listOf(
    AppNotification(
        id = "1",
        title = "System update available",
        content = "A new version is available. It includes performance improvements and bug fixes. Update now to get the best experience.",
        time = "10 min ago",
        type = NotificationType.SYSTEM,
        unread = true,
    ),
    AppNotification(
        id = "2",
        title = "Weekly report ready",
        content = "Your weekly summary has been generated. Open the reports section to review the key metrics and trends.",
        time = "1 hour ago",
        type = NotificationType.ACTIVITY,
        unread = true,
    ),
    AppNotification(
        id = "3",
        title = "Scheduled maintenance",
        content = "The service will undergo scheduled maintenance on Sunday from 02:00 to 04:00. Some features may be unavailable during this window.",
        time = "3 hours ago",
        type = NotificationType.SYSTEM,
        unread = true,
    ),
    AppNotification(
        id = "4",
        title = "New team member joined",
        content = "A new member has joined your team. Visit team management to review their role and permissions.",
        time = "Yesterday",
        type = NotificationType.ACTIVITY,
        unread = false,
    ),
    AppNotification(
        id = "5",
        title = "Password changed",
        content = "Your account password was changed successfully. If this was not you, please contact support immediately.",
        time = "2 days ago",
        type = NotificationType.SYSTEM,
        unread = false,
    ),
    AppNotification(
        id = "6",
        title = "Task assigned to you",
        content = "You have been assigned a new task in the current project. Check your task list for details and the due date.",
        time = "3 days ago",
        type = NotificationType.ACTIVITY,
        unread = false,
    ),
)
