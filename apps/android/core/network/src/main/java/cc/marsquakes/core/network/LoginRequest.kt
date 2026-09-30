package cc.marsquakes.core.network

import kotlinx.serialization.Serializable

/**
 * Payload of `POST /sys/login`.
 *
 * [captcha] and [checkKey] are always sent even though the dev profile disables the
 * captcha; the backend treats their emptiness as "no captcha".
 */
@Serializable
data class LoginRequest(
    val username: String,
    val password: String,
    val captcha: String = "",
    val checkKey: String = "",
)
