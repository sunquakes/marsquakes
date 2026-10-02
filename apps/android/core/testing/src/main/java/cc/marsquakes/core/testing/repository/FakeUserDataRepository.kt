package cc.marsquakes.core.testing.repository

import cc.marsquakes.core.data.repository.UserDataRepository
import cc.marsquakes.core.model.DarkThemeMode
import cc.marsquakes.core.model.UserPreferences
import kotlinx.coroutines.channels.BufferOverflow
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow

class FakeUserDataRepository : UserDataRepository {

    private val _userPreferences: MutableSharedFlow<UserPreferences> =
        MutableSharedFlow<UserPreferences>(
            replay = 1,
            onBufferOverflow = BufferOverflow.DROP_OLDEST,
        ).apply { tryEmit(UserPreferences()) }

    override val userPreferences: Flow<UserPreferences> = _userPreferences.asSharedFlow()

    override suspend fun setDarkThemeMode(mode: DarkThemeMode) {
        _userPreferences.tryEmit(_userPreferences.replayCache.first().copy(darkThemeMode = mode))
    }

    override suspend fun setDynamicColor(enabled: Boolean) {
        _userPreferences.tryEmit(_userPreferences.replayCache.first().copy(dynamicColor = enabled))
    }
}
