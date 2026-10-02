package cc.marsquakes.core.data.repository

import cc.marsquakes.core.model.SearchResultItem

interface SearchRepository {

    val recentQueries: List<String>

    suspend fun search(query: String): List<SearchResultItem>
}
