package cc.marsquakes.core.data.repository

import cc.marsquakes.core.model.AppNotification
import kotlinx.coroutines.flow.Flow

interface NotificationsRepository {

    val notifications: Flow<List<AppNotification>>

    suspend fun markAsRead(id: String)
}
