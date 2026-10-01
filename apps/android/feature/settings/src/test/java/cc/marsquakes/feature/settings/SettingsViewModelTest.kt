package cc.marsquakes.feature.settings

import app.cash.turbine.test
import cc.marsquakes.core.model.AuthState
import cc.marsquakes.core.model.DarkThemeMode
import cc.marsquakes.core.model.User
import cc.marsquakes.core.testing.repository.FakeAuthRepository
import cc.marsquakes.core.testing.repository.FakeUserDataRepository
import cc.marsquakes.core.testing.util.MainDispatcherRule
import kotlinx.coroutines.test.runTest
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull

class SettingsViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private lateinit var authRepository: FakeAuthRepository
    private lateinit var userDataRepository: FakeUserDataRepository

    @Before
    fun setup() {
        authRepository = FakeAuthRepository()
        userDataRepository = FakeUserDataRepository()
    }

    @Test
    fun state_hasDefaultValues_initially() = runTest {
        val viewModel = SettingsViewModel(authRepository, userDataRepository)

        viewModel.uiState.test {
            val state = awaitItem()
            assertNull(state.user)
            assertEquals(DarkThemeMode.SYSTEM, state.darkThemeMode)
            assertEquals(false, state.dynamicColor)
            assertEquals(true, state.pushEnabled)
            assertEquals(false, state.emailEnabled)
            cancelAndIgnoreRemainingEvents()
        }
    }

    @Test
    fun state_exposesUser_whenSignedIn() = runTest {
        val user = User(id = "1", username = "tester", nickname = "Tester")
        authRepository.sendAuthState(AuthState.SignedIn(user))
        val viewModel = SettingsViewModel(authRepository, userDataRepository)

        viewModel.uiState.test {
            assertEquals(user, awaitItem().user)
        }
    }

    @Test
    fun setDarkThemeMode_delegatesToRepository() = runTest {
        val viewModel = SettingsViewModel(authRepository, userDataRepository)

        viewModel.uiState.test {
            awaitItem()

            viewModel.setDarkThemeMode(DarkThemeMode.DARK)

            assertEquals(DarkThemeMode.DARK, awaitItem().darkThemeMode)
        }
    }

    @Test
    fun setDynamicColor_delegatesToRepository() = runTest {
        val viewModel = SettingsViewModel(authRepository, userDataRepository)

        viewModel.uiState.test {
            awaitItem()

            viewModel.setDynamicColor(true)

            assertEquals(true, awaitItem().dynamicColor)
        }
    }

    @Test
    fun setPushEnabled_updatesState() = runTest {
        val viewModel = SettingsViewModel(authRepository, userDataRepository)

        viewModel.uiState.test {
            awaitItem()

            viewModel.setPushEnabled(false)

            assertEquals(false, awaitItem().pushEnabled)
        }
    }

    @Test
    fun setEmailEnabled_updatesState() = runTest {
        val viewModel = SettingsViewModel(authRepository, userDataRepository)

        viewModel.uiState.test {
            awaitItem()

            viewModel.setEmailEnabled(true)

            assertEquals(true, awaitItem().emailEnabled)
        }
    }

    @Test
    fun logout_delegatesToRepository() = runTest {
        val user = User(id = "1", username = "tester", nickname = "Tester")
        authRepository.sendAuthState(AuthState.SignedIn(user))
        val viewModel = SettingsViewModel(authRepository, userDataRepository)

        viewModel.uiState.test {
            assertEquals(user, awaitItem().user)

            viewModel.logout()

            assertNull(awaitItem().user)
            assertEquals(1, authRepository.loggedOutCount)
        }
    }
}
