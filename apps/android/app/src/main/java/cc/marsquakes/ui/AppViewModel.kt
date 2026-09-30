package cc.marsquakes.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import cc.marsquakes.core.data.repository.AuthRepository
import cc.marsquakes.core.data.repository.UserDataRepository
import cc.marsquakes.core.model.AuthState
import cc.marsquakes.core.model.DarkThemeMode
import cc.marsquakes.core.model.UserPreferences
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * Holds the state the app shell itself renders from — the theme and the authentication state
 * that decides whether the login flow or the main scaffold is shown.
 *
 * Kept at the app level rather than in a feature because every screen is affected by it.
 */
@HiltViewModel
class AppViewModel @Inject constructor(
    private val userDataRepository: UserDataRepository,
    authRepository: AuthRepository,
) : ViewModel() {

    val userPreferences: StateFlow<UserPreferences> = userDataRepository.userPreferences
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(STOP_TIMEOUT_MILLIS),
            initialValue = UserPreferences(),
        )

    val authState: StateFlow<AuthState> = authRepository.authState
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(STOP_TIMEOUT_MILLIS),
            initialValue = AuthState.Loading,
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
