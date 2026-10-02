package cc.marsquakes.core.testing.repository

import cc.marsquakes.core.data.repository.SearchRepository
import cc.marsquakes.core.model.SearchResultItem

class FakeSearchRepository : SearchRepository {

    override var recentQueries: List<String> = emptyList()

    private val searchResults: MutableList<SearchResultItem> = mutableListOf()

    private var exception: Throwable? = null

    override suspend fun search(query: String): List<SearchResultItem> {
        exception?.let { throw it }
        return searchResults.filter { item ->
            item.title.contains(query, ignoreCase = true) ||
                item.description.contains(query, ignoreCase = true)
        }
    }

    fun seedRecentQueries(queries: List<String>) {
        recentQueries = queries
    }

    fun setSearchResults(results: List<SearchResultItem>) {
        searchResults.clear()
        searchResults.addAll(results)
    }

    fun setException(throwable: Throwable?) {
        exception = throwable
    }
}
