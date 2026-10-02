package cc.marsquakes.feature.search

import cc.marsquakes.core.common.result.Result
import cc.marsquakes.core.model.SearchResultItem
import cc.marsquakes.core.testing.repository.FakeSearchRepository
import cc.marsquakes.core.testing.util.MainDispatcherRule
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.runTest
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue

@OptIn(ExperimentalCoroutinesApi::class)
class SearchViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private lateinit var searchRepository: FakeSearchRepository

    private val sampleResults = listOf(
        SearchResultItem(id = "1", title = "Kotlin guide", description = "Learn Kotlin"),
        SearchResultItem(id = "2", title = "Compose docs", description = "Build UIs"),
    )

    @Before
    fun setup() {
        searchRepository = FakeSearchRepository()
    }

    @Test
    fun state_hasRepositoryHistory_initially() {
        searchRepository.seedRecentQueries(listOf("kotlin", "compose"))
        val viewModel = SearchViewModel(searchRepository)

        assertEquals(listOf("kotlin", "compose"), viewModel.uiState.value.history)
        assertEquals(null, viewModel.uiState.value.results)
    }

    @Test
    fun onQueryChange_updatesQuery() {
        val viewModel = SearchViewModel(searchRepository)

        viewModel.onQueryChange("kotlin")

        assertEquals("kotlin", viewModel.uiState.value.query)
    }

    @Test
    fun onSearchSubmit_ignoresBlankQuery() {
        val viewModel = SearchViewModel(searchRepository)

        viewModel.onQueryChange("   ")
        viewModel.onSearchSubmit()

        assertTrue(viewModel.uiState.value.history.isEmpty())
        assertEquals(null, viewModel.uiState.value.results)
    }

    @Test
    fun onSearchSubmit_addsQueryToHistory() {
        val viewModel = SearchViewModel(searchRepository)

        viewModel.onQueryChange("kotlin")
        viewModel.onSearchSubmit()

        assertEquals(listOf("kotlin"), viewModel.uiState.value.history)
    }

    @Test
    fun onSearchSubmit_movesDuplicateQueryToFront() {
        searchRepository.seedRecentQueries(listOf("compose", "kotlin"))
        val viewModel = SearchViewModel(searchRepository)

        viewModel.onQueryChange("kotlin")
        viewModel.onSearchSubmit()

        assertEquals(listOf("kotlin", "compose"), viewModel.uiState.value.history)
    }

    @Test
    fun onSearchSubmit_limitsHistoryToEightItems() {
        searchRepository.seedRecentQueries(
            listOf("a", "b", "c", "d", "e", "f", "g", "h"),
        )
        val viewModel = SearchViewModel(searchRepository)

        viewModel.onQueryChange("new")
        viewModel.onSearchSubmit()

        assertEquals(8, viewModel.uiState.value.history.size)
        assertEquals("new", viewModel.uiState.value.history.first())
        assertEquals(false, viewModel.uiState.value.history.contains("h"))
    }

    @Test
    fun onSearchSubmit_emitsSuccessWithResults() = runTest {
        searchRepository.setSearchResults(sampleResults)
        val viewModel = SearchViewModel(searchRepository)

        viewModel.onQueryChange("kotlin")
        viewModel.onSearchSubmit()
        advanceUntilIdle()

        val results = viewModel.uiState.value.results
        check(results is Result.Success)
        assertEquals(
            listOf(SearchResultItem(id = "1", title = "Kotlin guide", description = "Learn Kotlin")),
            results.data,
        )
    }

    @Test
    fun onSearchSubmit_emitsErrorWhenRepositoryThrows() = runTest {
        val exception = RuntimeException("Network down")
        searchRepository.setException(exception)
        val viewModel = SearchViewModel(searchRepository)

        viewModel.onQueryChange("kotlin")
        viewModel.onSearchSubmit()
        advanceUntilIdle()

        val results = viewModel.uiState.value.results
        check(results is Result.Error)
        assertEquals(exception, results.exception)
    }

    @Test
    fun onTagClick_setsQueryAndSearches() = runTest {
        searchRepository.setSearchResults(sampleResults)
        val viewModel = SearchViewModel(searchRepository)

        viewModel.onTagClick("compose")
        advanceUntilIdle()

        assertEquals("compose", viewModel.uiState.value.query)
        val results = viewModel.uiState.value.results
        check(results is Result.Success)
        assertEquals(1, results.data.size)
    }

    @Test
    fun onClearHistory_emptiesHistory() {
        searchRepository.seedRecentQueries(listOf("kotlin"))
        val viewModel = SearchViewModel(searchRepository)

        viewModel.onClearHistory()

        assertTrue(viewModel.uiState.value.history.isEmpty())
    }
}
