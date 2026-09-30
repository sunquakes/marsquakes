package cc.marsquakes.core.datastore

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import cc.marsquakes.core.model.DarkThemeMode
import cc.marsquakes.core.model.User
import cc.marsquakes.core.model.UserPreferences
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

/**
 * The only writer of the preferences file.
 *
 * Reads are exposed as a [Flow] so the UI reacts to a change instead of polling, and an
 * unreadable stored value falls back to the default rather than throwing — a corrupt
 * preference must not make the app unlaunchable.
 */
@Singleton
class MarsquakesPreferencesDataSource @Inject constructor(
    private val dataStore: DataStore<Preferences>,
) {

    val userPreferences: Flow<UserPreferences> = dataStore.data.map { preferences ->
        UserPreferences(
            darkThemeMode = preferences[Keys.DARK_THEME_MODE].toDarkThemeMode(),
            dynamicColor = preferences[Keys.DYNAMIC_COLOR] ?: UserPreferences().dynamicColor,
        )
    }

    suspend fun setDarkThemeMode(mode: DarkThemeMode) {
        dataStore.edit { preferences -> preferences[Keys.DARK_THEME_MODE] = mode.name }
    }

    suspend fun setDynamicColor(enabled: Boolean) {
        dataStore.edit { preferences -> preferences[Keys.DYNAMIC_COLOR] = enabled }
    }

    val authSession: Flow<AuthSession> = dataStore.data.map { preferences ->
        val id = preferences[Keys.USER_ID]
        val username = preferences[Keys.USER_NAME]
        if (id.isNullOrEmpty() || username.isNullOrEmpty()) {
            AuthSession(user = null, token = "")
        } else {
            AuthSession(
                user = User(
                    id = id,
                    username = username,
                    nickname = preferences[Keys.USER_NICKNAME] ?: username,
                    email = preferences[Keys.USER_EMAIL] ?: "",
                    avatarUrl = preferences[Keys.USER_AVATAR] ?: "",
                ),
                token = preferences[Keys.AUTH_TOKEN] ?: "",
            )
        }
    }

    suspend fun saveSession(user: User, token: String) {
        dataStore.edit { preferences ->
            preferences[Keys.USER_ID] = user.id
            preferences[Keys.USER_NAME] = user.username
            preferences[Keys.USER_NICKNAME] = user.nickname
            preferences[Keys.USER_EMAIL] = user.email
            preferences[Keys.USER_AVATAR] = user.avatarUrl
            preferences[Keys.AUTH_TOKEN] = token
        }
    }

    suspend fun clearSession() {
        dataStore.edit { preferences ->
            preferences.remove(Keys.USER_ID)
            preferences.remove(Keys.USER_NAME)
            preferences.remove(Keys.USER_NICKNAME)
            preferences.remove(Keys.USER_EMAIL)
            preferences.remove(Keys.USER_AVATAR)
            preferences.remove(Keys.AUTH_TOKEN)
        }
    }

    private fun String?.toDarkThemeMode(): DarkThemeMode =
        DarkThemeMode.entries.firstOrNull { it.name == this } ?: UserPreferences().darkThemeMode

    private object Keys {
        val DARK_THEME_MODE = stringPreferencesKey("dark_theme_mode")
        val DYNAMIC_COLOR = booleanPreferencesKey("dynamic_color")
        val AUTH_TOKEN = stringPreferencesKey("auth_token")
        val USER_ID = stringPreferencesKey("user_id")
        val USER_NAME = stringPreferencesKey("user_name")
        val USER_NICKNAME = stringPreferencesKey("user_nickname")
        val USER_EMAIL = stringPreferencesKey("user_email")
        val USER_AVATAR = stringPreferencesKey("user_avatar")
    }
}
