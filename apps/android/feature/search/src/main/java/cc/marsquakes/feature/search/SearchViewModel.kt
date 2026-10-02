package cc.marsquakes.feature.search

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import cc.marsquakes.core.common.result.Result
import cc.marsquakes.core.data.repository.SearchRepository
import cc.marsquakes.core.model.SearchResultItem
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class SearchUiState(
    val query: String = "",
    val history: List<String> = emptyList(),
    val results: Result<List<SearchResultItem>>? = null,
)

@HiltViewModel
class SearchViewModel @Inject constructor(
    private val searchRepository: SearchRepository,
) : ViewModel() {
    private val _uiState = MutableStateFlow(
        SearchUiState(history = searchRepository.recentQueries),
    )
    val uiState: StateFlow<SearchUiState> = _uiState.asStateFlow()

    fun onQueryChange(query: String) { _uiState.update { it.copy(query = query) } }

    fun onSearchSubmit() {
        val query = _uiState.value.query.trim()
        if (query.isEmpty()) return
        _uiState.update { state ->
            val updatedHistory = listOf(query) + state.history.filterNot { it == query }
            state.copy(
                history = updatedHistory.take(HISTORY_LIMIT),
                results = Result.Loading,
            )
        }
        viewModelScope.launch {
            try {
                val results = searchRepository.search(query)
                _uiState.update { it.copy(results = Result.Success(results)) }
            } catch (exception: Throwable) {
                _uiState.update { it.copy(results = Result.Error(exception)) }
            }
        }
    }

    fun onTagClick(tag: String) {
        _uiState.update { it.copy(query = tag) }
        onSearchSubmit()
    }

    fun onClearHistory() { _uiState.update { it.copy(history = emptyList()) } }

    private companion object { const val HISTORY_LIMIT = 8 }
}
