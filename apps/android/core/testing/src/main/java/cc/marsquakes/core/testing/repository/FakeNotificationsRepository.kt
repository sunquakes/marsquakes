package cc.marsquakes.core.testing.repository

import cc.marsquakes.core.data.repository.NotificationsRepository
import cc.marsquakes.core.model.AppNotification
import kotlinx.coroutines.channels.BufferOverflow
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asSharedFlow

class FakeNotificationsRepository : NotificationsRepository {

    private val _notifications: MutableSharedFlow<List<AppNotification>> =
        MutableSharedFlow(replay = 1, onBufferOverflow = BufferOverflow.DROP_OLDEST)

    override val notifications: Flow<List<AppNotification>> = _notifications.asSharedFlow()

    private val markedAsReadIds = MutableStateFlow<List<String>>(emptyList())

    override suspend fun markAsRead(id: String) {
        markedAsReadIds.value = markedAsReadIds.value + id
        _notifications.tryEmit(
            _notifications.replayCache.firstOrNull().orEmpty().map { notification ->
                if (notification.id == id) notification.copy(unread = false) else notification
            },
        )
    }

    fun sendNotifications(notifications: List<AppNotification>) {
        _notifications.tryEmit(notifications)
    }
}
