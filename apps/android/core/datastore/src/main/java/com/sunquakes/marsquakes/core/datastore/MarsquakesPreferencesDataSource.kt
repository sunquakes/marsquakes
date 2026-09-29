package com.sunquakes.marsquakes.core.datastore

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import com.sunquakes.marsquakes.core.model.DarkThemeMode
import com.sunquakes.marsquakes.core.model.UserPreferences
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

    private fun String?.toDarkThemeMode(): DarkThemeMode =
        DarkThemeMode.entries.firstOrNull { it.name == this } ?: UserPreferences().darkThemeMode

    private object Keys {
        val DARK_THEME_MODE = stringPreferencesKey("dark_theme_mode")
        val DYNAMIC_COLOR = booleanPreferencesKey("dynamic_color")
    }
}
