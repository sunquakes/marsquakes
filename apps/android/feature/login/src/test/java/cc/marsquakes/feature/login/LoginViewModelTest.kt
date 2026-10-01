package cc.marsquakes.feature.login

import cc.marsquakes.core.testing.repository.FakeAuthRepository
import cc.marsquakes.core.testing.util.MainDispatcherRule
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.runTest
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull

@OptIn(ExperimentalCoroutinesApi::class)
class LoginViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private lateinit var authRepository: FakeAuthRepository

    @Before
    fun setup() {
        authRepository = FakeAuthRepository()
    }

    @Test
    fun state_hasDefaultValues_initially() {
        val viewModel = LoginViewModel(authRepository)

        val state = viewModel.uiState.value
        assertEquals("", state.username)
        assertEquals("", state.password)
        assertEquals(false, state.isLoading)
        assertNull(state.errorMessage)
    }

    @Test
    fun onUsernameChange_updatesUsernameAndClearsError() {
        val viewModel = LoginViewModel(authRepository)

        viewModel.onUsernameChange("tester")

        assertEquals("tester", viewModel.uiState.value.username)
    }

    @Test
    fun onPasswordChange_updatesPasswordAndClearsError() {
        val viewModel = LoginViewModel(authRepository)

        viewModel.onPasswordChange("secret")

        assertEquals("secret", viewModel.uiState.value.password)
    }

    @Test
    fun onLoginClick_succeedsWithoutError() = runTest {
        val viewModel = LoginViewModel(authRepository)

        viewModel.onUsernameChange("tester")
        viewModel.onPasswordChange("secret")
        viewModel.onLoginClick()
        advanceUntilIdle()

        val state = viewModel.uiState.value
        assertEquals(false, state.isLoading)
        assertNull(state.errorMessage)
    }

    @Test
    fun onLoginClick_exposesErrorMessageOnFailure() = runTest {
        authRepository.setLoginResult(Result.failure(RuntimeException("Invalid credentials")))
        val viewModel = LoginViewModel(authRepository)

        viewModel.onUsernameChange("tester")
        viewModel.onPasswordChange("wrong")
        viewModel.onLoginClick()
        advanceUntilIdle()

        val state = viewModel.uiState.value
        assertEquals(false, state.isLoading)
        assertEquals("Invalid credentials", state.errorMessage)
    }

    @Test
    fun onLoginClick_doesNothingWhileLoading() = runTest {
        val viewModel = LoginViewModel(authRepository)

        viewModel.onUsernameChange("tester")
        viewModel.onPasswordChange("secret")
        viewModel.onLoginClick()
        viewModel.onLoginClick()
        advanceUntilIdle()

        assertEquals(false, viewModel.uiState.value.isLoading)
    }

    @Test
    fun changingInput_clearsErrorMessage() = runTest {
        authRepository.setLoginResult(Result.failure(RuntimeException("Invalid credentials")))
        val viewModel = LoginViewModel(authRepository)

        viewModel.onUsernameChange("tester")
        viewModel.onPasswordChange("wrong")
        viewModel.onLoginClick()
        advanceUntilIdle()

        assertEquals("Invalid credentials", viewModel.uiState.value.errorMessage)

        viewModel.onUsernameChange("tester2")
        assertNull(viewModel.uiState.value.errorMessage)
    }
}
