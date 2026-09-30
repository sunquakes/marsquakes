package cc.marsquakes.feature.profile

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import cc.marsquakes.core.data.repository.AuthRepository
import cc.marsquakes.core.data.repository.UserDataRepository
import cc.marsquakes.core.model.AuthState
import cc.marsquakes.core.model.DarkThemeMode
import cc.marsquakes.core.model.User
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ProfileUiState(
    val user: User? = null,
    val darkThemeMode: DarkThemeMode = DarkThemeMode.SYSTEM,
    val dynamicColor: Boolean = true,
)

@HiltViewModel
class ProfileViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val userDataRepository: UserDataRepository,
) : ViewModel() {

    val uiState: StateFlow<ProfileUiState> = combine(
        authRepository.authState,
        userDataRepository.userPreferences,
    ) { authState, preferences ->
        ProfileUiState(
            user = (authState as? AuthState.SignedIn)?.user,
            darkThemeMode = preferences.darkThemeMode,
            dynamicColor = preferences.dynamicColor,
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(STOP_TIMEOUT_MILLIS),
        initialValue = ProfileUiState(),
    )

    fun setDarkThemeMode(mode: DarkThemeMode) {
        viewModelScope.launch { userDataRepository.setDarkThemeMode(mode) }
    }

    fun setDynamicColor(enabled: Boolean) {
        viewModelScope.launch { userDataRepository.setDynamicColor(enabled) }
    }

    fun logout() {
        viewModelScope.launch { authRepository.logout() }
    }

    private companion object {
        const val STOP_TIMEOUT_MILLIS = 5_000L
    }
}
