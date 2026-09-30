package cc.marsquakes.core.network

import kotlinx.serialization.Serializable

/**
 * The envelope JeecgBoot wraps every response in.
 *
 * A transport-level 200 with [success] equal to false is still a failed request, so callers
 * must inspect the body rather than rely on HTTP status codes.
 */
@Serializable
data class NetworkResponse<T>(
    val success: Boolean = false,
    val message: String = "",
    val code: Int = 0,
    val result: T? = null,
)
