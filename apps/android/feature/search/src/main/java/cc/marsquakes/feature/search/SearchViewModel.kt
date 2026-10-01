package cc.marsquakes.feature.search

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class SearchResultItem(
    val id: String,
    val title: String,
    val description: String,
)

data class SearchUiState(
    val query: String = "",
    val history: List<String> = emptyList(),
    val results: List<SearchResultItem> = emptyList(),
)

@HiltViewModel
class SearchViewModel @Inject constructor() : ViewModel() {

    private val _uiState = MutableStateFlow(
        SearchUiState(history = SAMPLE_HISTORY),
    )
    val uiState: StateFlow<SearchUiState> = _uiState.asStateFlow()

    fun onQueryChange(query: String) {
        _uiState.update { it.copy(query = query) }
    }

    fun onSearchSubmit() {
        val query = _uiState.value.query.trim()
        if (query.isEmpty()) return
        _uiState.update { state ->
            val updatedHistory = listOf(query) + state.history.filterNot { it == query }
            state.copy(
                history = updatedHistory.take(HISTORY_LIMIT),
                results = SAMPLE_ITEMS.filter { item ->
                    item.title.contains(query, ignoreCase = true) ||
                        item.description.contains(query, ignoreCase = true)
                },
            )
        }
    }

    fun onTagClick(tag: String) {
        _uiState.update { it.copy(query = tag) }
        onSearchSubmit()
    }

    fun onClearHistory() {
        viewModelScope.launch {
            _uiState.update { it.copy(history = emptyList()) }
        }
    }

    private companion object {
        const val HISTORY_LIMIT = 8
        val SAMPLE_HISTORY = listOf("dashboard", "report", "settings", "project")
        val SAMPLE_ITEMS = listOf(
            SearchResultItem("1", "Dashboard overview", "A summary of your key metrics and activity"),
            SearchResultItem("2", "Weekly report", "Automated performance report for the current week"),
            SearchResultItem("3", "Project settings", "Manage project members, permissions and integrations"),
            SearchResultItem("4", "Notification preferences", "Choose what alerts you receive and how often"),
            SearchResultItem("5", "Profile and account", "Update your personal information and credentials"),
            SearchResultItem("6", "Getting started guide", "Learn the basics and set up your workspace"),
            SearchResultItem("7", "Data export", "Download your data in CSV or JSON format"),
            SearchResultItem("8", "Team management", "Invite teammates and assign roles"),
        )
    }
}
