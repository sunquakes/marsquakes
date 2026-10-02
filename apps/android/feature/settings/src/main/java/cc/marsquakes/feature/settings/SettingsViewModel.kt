package cc.marsquakes.feature.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import cc.marsquakes.core.data.repository.AuthRepository
import cc.marsquakes.core.data.repository.UserDataRepository
import cc.marsquakes.core.model.AuthState
import cc.marsquakes.core.model.DarkThemeMode
import cc.marsquakes.core.model.User
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class NotificationSettings(
    val pushEnabled: Boolean = true,
    val emailEnabled: Boolean = false,
)

data class SettingsUiState(
    val user: User? = null,
    val darkThemeMode: DarkThemeMode = DarkThemeMode.SYSTEM,
    val dynamicColor: Boolean = false,
    val pushEnabled: Boolean = true,
    val emailEnabled: Boolean = false,
)

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val userDataRepository: UserDataRepository,
) : ViewModel() {

    private val notificationSettings = MutableStateFlow(NotificationSettings())

    val uiState: StateFlow<SettingsUiState> = combine(
        authRepository.authState,
        userDataRepository.userPreferences,
        notificationSettings,
    ) { authState, preferences, notifications ->
        SettingsUiState(
            user = (authState as? AuthState.SignedIn)?.user,
            darkThemeMode = preferences.darkThemeMode,
            dynamicColor = preferences.dynamicColor,
            pushEnabled = notifications.pushEnabled,
            emailEnabled = notifications.emailEnabled,
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(STOP_TIMEOUT_MILLIS),
        initialValue = SettingsUiState(),
    )

    fun setDarkThemeMode(mode: DarkThemeMode) {
        viewModelScope.launch { userDataRepository.setDarkThemeMode(mode) }
    }

    fun setDynamicColor(enabled: Boolean) {
        viewModelScope.launch { userDataRepository.setDynamicColor(enabled) }
    }

    fun setPushEnabled(enabled: Boolean) {
        notificationSettings.update { it.copy(pushEnabled = enabled) }
    }

    fun setEmailEnabled(enabled: Boolean) {
        notificationSettings.update { it.copy(emailEnabled = enabled) }
    }

    fun logout() {
        viewModelScope.launch { authRepository.logout() }
    }

    private companion object {
        const val STOP_TIMEOUT_MILLIS = 5_000L
    }
}
