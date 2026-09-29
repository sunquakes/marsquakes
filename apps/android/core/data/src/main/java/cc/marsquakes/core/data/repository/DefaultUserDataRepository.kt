package cc.marsquakes.core.data.repository

import cc.marsquakes.core.datastore.MarsquakesPreferencesDataSource
import cc.marsquakes.core.model.DarkThemeMode
import cc.marsquakes.core.model.UserPreferences
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class DefaultUserDataRepository @Inject constructor(
    private val preferencesDataSource: MarsquakesPreferencesDataSource,
) : UserDataRepository {

    override val userPreferences: Flow<UserPreferences> = preferencesDataSource.userPreferences

    override suspend fun setDarkThemeMode(mode: DarkThemeMode) =
        preferencesDataSource.setDarkThemeMode(mode)

    override suspend fun setDynamicColor(enabled: Boolean) =
        preferencesDataSource.setDynamicColor(enabled)
}
