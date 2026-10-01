package cc.marsquakes.feature.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import cc.marsquakes.core.data.repository.AuthRepository
import cc.marsquakes.core.model.AuthState
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import javax.inject.Inject

data class HomeUiState(
    val nickname: String = "",
)

@HiltViewModel
class HomeViewModel @Inject constructor(
    authRepository: AuthRepository,
) : ViewModel() {

    val uiState: StateFlow<HomeUiState> = authRepository.authState
        .map { state ->
            HomeUiState(nickname = (state as? AuthState.SignedIn)?.user?.nickname ?: "")
        }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(STOP_TIMEOUT_MILLIS),
            initialValue = HomeUiState(),
        )

    private companion object {
        const val STOP_TIMEOUT_MILLIS = 5_000L
    }
}
