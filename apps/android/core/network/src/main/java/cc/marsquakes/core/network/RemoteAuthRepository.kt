package cc.marsquakes.core.network

import cc.marsquakes.core.common.di.Dispatcher
import cc.marsquakes.core.common.di.MarsquakesDispatcher
import cc.marsquakes.core.data.repository.AuthRepository
import cc.marsquakes.core.datastore.MarsquakesPreferencesDataSource
import cc.marsquakes.core.model.AuthState
import cc.marsquakes.core.model.User
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.onStart
import kotlinx.coroutines.withContext
import javax.inject.Inject

/**
 * API-backed [AuthRepository].
 *
 * This class only ships in the Android "api" variant; the CLI adds this module and flips
 * the Hilt binding away from the local mock. Credentials, session storage and the
 * [authState] contract are identical between the two variants — only this implementation
 * differs.
 */
class RemoteAuthRepository @Inject constructor(
    private val preferencesDataSource: MarsquakesPreferencesDataSource,
    private val networkAuthDataSource: NetworkAuthDataSource,
    private val tokenHolder: AccessTokenHolder,
    @Dispatcher(MarsquakesDispatcher.IO) private val ioDispatcher: CoroutineDispatcher,
) : AuthRepository {

    override val authState: Flow<AuthState> = preferencesDataSource.authSession
        .map { session ->
            val user = session.user
            if (user == null) {
                tokenHolder.clear()
                AuthState.SignedOut
            } else {
                tokenHolder.setToken(session.token)
                AuthState.SignedIn(user)
            }
        }
        .onStart { emit(AuthState.Loading) }
        .flowOn(ioDispatcher)

    override suspend fun login(username: String, password: String): Result<Unit> =
        withContext(ioDispatcher) {
            val name = username.trim()
            when {
                name.isEmpty() ->
                    Result.failure(IllegalArgumentException("Username cannot be empty"))
                password.isEmpty() ->
                    Result.failure(IllegalArgumentException("Password cannot be empty"))
                else -> runCatching {
                    val result = networkAuthDataSource.login(name, password)
                    val info = result.userInfo
                        ?: throw java.io.IOException("Empty user info")
                    val user = User(
                        id = info.id ?: name,
                        username = info.username ?: name,
                        nickname = info.realname ?: info.username ?: name,
                        email = info.email ?: "",
                        avatarUrl = info.avatar ?: "",
                    )
                    tokenHolder.setToken(result.token)
                    preferencesDataSource.saveSession(user = user, token = result.token)
                }
            }
        }

    override suspend fun logout() {
        withContext(ioDispatcher) {
            runCatching { networkAuthDataSource.logout() }
            tokenHolder.clear()
            preferencesDataSource.clearSession()
        }
    }
}
