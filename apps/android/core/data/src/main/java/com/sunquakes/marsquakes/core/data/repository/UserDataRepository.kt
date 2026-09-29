package com.sunquakes.marsquakes.core.data.repository

import com.sunquakes.marsquakes.core.model.DarkThemeMode
import com.sunquakes.marsquakes.core.model.UserPreferences
import kotlinx.coroutines.flow.Flow

interface UserDataRepository {

    val userPreferences: Flow<UserPreferences>

    suspend fun setDarkThemeMode(mode: DarkThemeMode)

    suspend fun setDynamicColor(enabled: Boolean)
}
