package cc.marsquakes.core.network

import okhttp3.Interceptor
import okhttp3.Response
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Attaches the current session token as `X-Access-Token`.
 *
 * The token is held in memory instead of being read from storage on every request: the
 * repository pushes it in after login and after an app restart rehydrates it.
 */
@Singleton
class AccessTokenInterceptor @Inject constructor(
    private val tokenHolder: AccessTokenHolder,
) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val token = tokenHolder.token
        val request = if (token.isEmpty()) {
            chain.request()
        } else {
            chain.request().newBuilder()
                .header(ACCESS_TOKEN_HEADER, token)
                .build()
        }
        return chain.proceed(request)
    }

    private companion object {
        const val ACCESS_TOKEN_HEADER = "X-Access-Token"
    }
}

/**
 * Process-wide holder of the bearer token.
 */
@Singleton
class AccessTokenHolder @Inject constructor() {

    @Volatile
    var token: String = ""
        private set

    fun setToken(value: String) {
        token = value
    }

    fun clear() {
        token = ""
    }
}
