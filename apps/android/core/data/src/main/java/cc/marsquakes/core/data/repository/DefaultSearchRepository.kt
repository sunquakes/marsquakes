package cc.marsquakes.core.data.repository

import cc.marsquakes.core.model.SearchResultItem
import javax.inject.Inject

class DefaultSearchRepository @Inject constructor() : SearchRepository {

    override val recentQueries: List<String> = SEED_RECENT_QUERIES

    override suspend fun search(query: String): List<SearchResultItem> =
        SAMPLE_ITEMS.filter { item ->
            item.title.contains(query, ignoreCase = true) ||
                item.description.contains(query, ignoreCase = true)
        }

    private companion object {
        val SEED_RECENT_QUERIES = listOf("dashboard", "report", "settings", "project")
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
