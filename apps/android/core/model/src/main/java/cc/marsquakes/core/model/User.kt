package cc.marsquakes.core.model

/**
 * The signed-in account.
 *
 * Pure Kotlin with no framework annotations so every layer can map into it.
 */
data class User(
    val id: String,
    val username: String,
    val nickname: String,
    val email: String = "",
    val avatarUrl: String = "",
)

/**
 * The authentication state the whole app reacts to.
 *
 * [Loading] covers the brief window while stored credentials are being read, [SignedOut] means
 * no usable session, and [SignedIn] carries the resolved [User].
 */
sealed interface AuthState {

    data object Loading : AuthState

    data object SignedOut : AuthState

    data class SignedIn(val user: User) : AuthState
}
