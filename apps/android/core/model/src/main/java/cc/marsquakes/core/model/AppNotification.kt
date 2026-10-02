package cc.marsquakes.core.model

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
