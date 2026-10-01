package cc.marsquakes.feature.notifications

import app.cash.turbine.test
import cc.marsquakes.core.common.result.Result
import cc.marsquakes.core.model.AppNotification
import cc.marsquakes.core.model.NotificationType
import cc.marsquakes.core.testing.repository.FakeNotificationsRepository
import cc.marsquakes.core.testing.util.MainDispatcherRule
import kotlinx.coroutines.test.runTest
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.Assert.assertEquals

class NotificationsViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private lateinit var notificationsRepository: FakeNotificationsRepository

    private val sampleNotifications = listOf(
        AppNotification(
            id = "1",
            title = "Welcome",
            content = "Thanks for joining",
            time = "10:00",
            type = NotificationType.SYSTEM,
            unread = true,
        ),
        AppNotification(
            id = "2",
            title = "New activity",
            content = "Someone mentioned you",
            time = "Yesterday",
            type = NotificationType.ACTIVITY,
            unread = false,
        ),
    )

    @Before
    fun setup() {
        notificationsRepository = FakeNotificationsRepository()
    }

    @Test
    fun state_isLoading_initially() = runTest {
        val viewModel = NotificationsViewModel(notificationsRepository)

        viewModel.uiState.test {
            assertEquals(Result.Loading, awaitItem().notifications)
            cancelAndIgnoreRemainingEvents()
        }
    }

    @Test
    fun state_isSuccess_whenRepositoryEmits() = runTest {
        notificationsRepository.sendNotifications(sampleNotifications)
        val viewModel = NotificationsViewModel(notificationsRepository)

        viewModel.uiState.test {
            var result = awaitItem().notifications
            while (result !is Result.Success) result = awaitItem().notifications
            assertEquals(sampleNotifications, result.data)
        }
    }

    @Test
    fun state_isSuccessWithEmptyList_whenRepositoryEmitsEmpty() = runTest {
        notificationsRepository.sendNotifications(emptyList())
        val viewModel = NotificationsViewModel(notificationsRepository)

        viewModel.uiState.test {
            var result = awaitItem().notifications
            while (result !is Result.Success) result = awaitItem().notifications
            assertEquals(emptyList<AppNotification>(), result.data)
        }
    }

    @Test
    fun markAsRead_delegatesToRepository() = runTest {
        notificationsRepository.sendNotifications(sampleNotifications)
        val viewModel = NotificationsViewModel(notificationsRepository)

        viewModel.uiState.test {
            var initial = awaitItem().notifications
            while (initial !is Result.Success) initial = awaitItem().notifications
            assertEquals(sampleNotifications, initial.data)

            viewModel.markAsRead("1")

            var updated = awaitItem().notifications
            while (updated !is Result.Success) updated = awaitItem().notifications
            assertEquals(false, updated.data.first { it.id == "1" }.unread)
        }
    }
}
