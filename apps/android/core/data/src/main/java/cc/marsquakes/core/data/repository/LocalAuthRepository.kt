package cc.marsquakes.core.data.repository

import cc.marsquakes.core.common.di.Dispatcher
import cc.marsquakes.core.common.di.MarsquakesDispatcher
import cc.marsquakes.core.datastore.MarsquakesPreferencesDataSource
import cc.marsquakes.core.model.AuthState
import cc.marsquakes.core.model.User
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.onStart
import kotlinx.coroutines.withContext
import java.util.UUID
import javax.inject.Inject

/**
 * Local, network-free authentication implementation.
 *
 * Credentials are validated against simple in-memory rules so the app is fully runnable
 * without a backend. This is the default [AuthRepository]; the CLI swaps the Hilt binding
 * for the API-backed implementation when the user chooses the "api" Android mode.
 */
class LocalAuthRepository @Inject constructor(
    private val preferencesDataSource: MarsquakesPreferencesDataSource,
    @Dispatcher(MarsquakesDispatcher.IO) private val ioDispatcher: CoroutineDispatcher,
) : AuthRepository {

    override val authState: Flow<AuthState> = preferencesDataSource.authSession
        .map { session ->
            val user = session.user
            if (user == null) AuthState.SignedOut else AuthState.SignedIn(user)
        }
        .onStart { emit(AuthState.Loading) }
        .flowOn(ioDispatcher)

    override suspend fun login(username: String, password: String): Result<Unit> =
        withContext(ioDispatcher) {
            val name = username.trim()
            when {
                name.isEmpty() -> Result.failure(IllegalArgumentException("Username cannot be empty"))
                password.length < MIN_PASSWORD_LENGTH ->
                    Result.failure(IllegalArgumentException("Password must be at least $MIN_PASSWORD_LENGTH characters"))
                else -> {
                    delay(MOCK_NETWORK_DELAY_MILLIS)
                    val user = User(
                        id = UUID.nameUUIDFromBytes(name.toByteArray()).toString(),
                        username = name,
                        nickname = name,
                        email = "$name@marsquakes.cc",
                    )
                    preferencesDataSource.saveSession(user = user, token = "mock-token-${UUID.randomUUID()}")
                    Result.success(Unit)
                }
            }
        }

    override suspend fun logout() {
        withContext(ioDispatcher) { preferencesDataSource.clearSession() }
    }

    private companion object {
        const val MIN_PASSWORD_LENGTH = 6
        const val MOCK_NETWORK_DELAY_MILLIS = 800L
    }
}
