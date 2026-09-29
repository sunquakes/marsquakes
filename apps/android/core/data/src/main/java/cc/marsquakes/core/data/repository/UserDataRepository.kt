package cc.marsquakes.core.data.repository

import cc.marsquakes.core.model.DarkThemeMode
import cc.marsquakes.core.model.UserPreferences
import kotlinx.coroutines.flow.Flow

interface UserDataRepository {

    val userPreferences: Flow<UserPreferences>

    suspend fun setDarkThemeMode(mode: DarkThemeMode)

    suspend fun setDynamicColor(enabled: Boolean)
}
