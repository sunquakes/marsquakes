package cc.marsquakes.core.data.repository

import cc.marsquakes.core.model.AuthState
import kotlinx.coroutines.flow.Flow

interface AuthRepository {

    val authState: Flow<AuthState>

    suspend fun login(username: String, password: String): Result<Unit>

    suspend fun logout()
}
