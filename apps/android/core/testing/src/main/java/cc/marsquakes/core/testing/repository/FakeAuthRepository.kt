package cc.marsquakes.core.testing.repository

import cc.marsquakes.core.data.repository.AuthRepository
import cc.marsquakes.core.model.AuthState
import kotlinx.coroutines.channels.BufferOverflow
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow

class FakeAuthRepository : AuthRepository {

    private val _authState: MutableSharedFlow<AuthState> =
        MutableSharedFlow(replay = 1, onBufferOverflow = BufferOverflow.DROP_OLDEST)

    override val authState: Flow<AuthState> = _authState.asSharedFlow()

    private var loginResult: Result<Unit> = Result.success(Unit)

    val loggedOutCount get() = _loggedOutCount
    private var _loggedOutCount = 0

    init {
        sendAuthState(AuthState.SignedOut)
    }

    override suspend fun login(username: String, password: String): Result<Unit> {
        if (loginResult.isSuccess) {
            sendAuthState(
                AuthState.SignedIn(
                    cc.marsquakes.core.model.User(
                        id = "1",
                        username = username,
                        nickname = username,
                    ),
                ),
            )
        }
        return loginResult
    }

    override suspend fun logout() {
        _loggedOutCount++
        sendAuthState(AuthState.SignedOut)
    }

    fun sendAuthState(state: AuthState) {
        _authState.tryEmit(state)
    }

    fun setLoginResult(result: Result<Unit>) {
        loginResult = result
    }
}
