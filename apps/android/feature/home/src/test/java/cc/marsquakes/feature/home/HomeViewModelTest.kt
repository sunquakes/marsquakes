package cc.marsquakes.feature.home

import app.cash.turbine.test
import cc.marsquakes.core.model.AuthState
import cc.marsquakes.core.model.User
import cc.marsquakes.core.testing.repository.FakeAuthRepository
import cc.marsquakes.core.testing.util.MainDispatcherRule
import kotlinx.coroutines.test.runTest
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.Assert.assertEquals

class HomeViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private lateinit var authRepository: FakeAuthRepository

    @Before
    fun setup() {
        authRepository = FakeAuthRepository()
    }

    @Test
    fun state_isEmpty_whenSignedOut() = runTest {
        val viewModel = HomeViewModel(authRepository)

        viewModel.uiState.test {
            assertEquals(HomeUiState(nickname = ""), awaitItem())
        }
    }

    @Test
    fun state_exposesNickname_whenSignedIn() = runTest {
        authRepository.sendAuthState(
            AuthState.SignedIn(
                User(id = "1", username = "tester", nickname = "Tester"),
            ),
        )
        val viewModel = HomeViewModel(authRepository)

        viewModel.uiState.test {
            assertEquals(HomeUiState(nickname = "Tester"), awaitItem())
        }
    }

    @Test
    fun state_isEmpty_whileAuthStateLoading() = runTest {
        authRepository.sendAuthState(AuthState.Loading)
        val viewModel = HomeViewModel(authRepository)

        viewModel.uiState.test {
            assertEquals(HomeUiState(nickname = ""), awaitItem())
        }
    }
}
