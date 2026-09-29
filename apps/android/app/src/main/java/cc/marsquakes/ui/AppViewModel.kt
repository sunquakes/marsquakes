package cc.marsquakes.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import cc.marsquakes.core.data.repository.UserDataRepository
import cc.marsquakes.core.model.DarkThemeMode
import cc.marsquakes.core.model.UserPreferences
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * Holds the preferences the app shell itself renders from — currently the theme.
 *
 * Kept at the app level rather than in a feature because every screen is affected by it.
 */
@HiltViewModel
class AppViewModel @Inject constructor(
    private val userDataRepository: UserDataRepository,
) : ViewModel() {

    val userPreferences: StateFlow<UserPreferences> = userDataRepository.userPreferences
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(STOP_TIMEOUT_MILLIS),
            initialValue = UserPreferences(),
        )

    fun setDarkThemeMode(mode: DarkThemeMode) {
        viewModelScope.launch { userDataRepository.setDarkThemeMode(mode) }
    }

    fun setDynamicColor(enabled: Boolean) {
        viewModelScope.launch { userDataRepository.setDynamicColor(enabled) }
    }

    private companion object {
        const val STOP_TIMEOUT_MILLIS = 5_000L
    }
}
