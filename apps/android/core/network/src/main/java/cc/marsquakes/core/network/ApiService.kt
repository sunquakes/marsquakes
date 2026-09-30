package cc.marsquakes.core.network

import kotlinx.serialization.json.JsonElement
import retrofit2.http.Body
import retrofit2.http.POST

/**
 * Retrofit description of the authentication endpoints.
 */
interface ApiService {

    @POST("sys/login")
    suspend fun login(@Body request: LoginRequest): NetworkResponse<LoginResult>

    @POST("sys/logout")
    suspend fun logout(): NetworkResponse<JsonElement>
}
