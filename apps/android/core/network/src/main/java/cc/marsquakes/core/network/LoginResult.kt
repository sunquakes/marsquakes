package cc.marsquakes.core.network

import kotlinx.serialization.Serializable

/**
 * `result` payload of a successful login.
 */
@Serializable
data class LoginResult(
    val token: String = "",
    val userInfo: NetworkUserInfo? = null,
)

/**
 * Backend shape of the signed-in user.
 *
 * Mapped into cc.marsquakes.core.model.User by the repository so serialization annotations
 * never leak into the model layer.
 */
@Serializable
data class NetworkUserInfo(
    val id: String? = null,
    val username: String? = null,
    val realname: String? = null,
    val email: String? = null,
    val avatar: String? = null,
)
