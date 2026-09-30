package cc.marsquakes.core.network

import java.io.IOException
import javax.inject.Inject

/**
 * Thin data layer over [ApiService] that converts the envelope into either a payload or an
 * exception carrying the backend message.
 */
interface NetworkAuthDataSource {

    suspend fun login(username: String, password: String): LoginResult

    suspend fun logout()
}

/**
 * Retrofit-backed [NetworkAuthDataSource].
 *
 * A backend business failure (HTTP 200 with `success=false`) becomes an [IOException] with
 * the server message so the same error surface covers network failures and rejected
 * credentials.
 */
class RetrofitAuthDataSource @Inject constructor(
    private val apiService: ApiService,
) : NetworkAuthDataSource {

    override suspend fun login(username: String, password: String): LoginResult {
        val response = apiService.login(LoginRequest(username = username, password = password))
        if (!response.success) {
            throw IOException(response.message.ifEmpty { "Login failed" })
        }
        return response.result ?: throw IOException("Empty login response")
    }

    override suspend fun logout() {
        val response = apiService.logout()
        if (!response.success) {
            throw IOException(response.message.ifEmpty { "Logout failed" })
        }
    }
}
