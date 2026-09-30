package cc.marsquakes.core.datastore

import cc.marsquakes.core.model.User

/**
 * The persisted sign-in session.
 *
 * The account and its token are read and written together so a session can never be observed
 * half written. A null [user] means there is no session, regardless of [token].
 */
data class AuthSession(
    val user: User?,
    val token: String,
)
