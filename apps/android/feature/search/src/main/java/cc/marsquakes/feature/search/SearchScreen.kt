package cc.marsquakes.feature.search

import cc.marsquakes.core.common.result.Result
import cc.marsquakes.core.model.SearchResultItem
import cc.marsquakes.core.ui.component.EmptyState
import cc.marsquakes.core.ui.component.ErrorState
import cc.marsquakes.core.ui.component.LoadingWheel
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.SearchOff
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.SearchBar
import androidx.compose.material3.SearchBarDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle

@Composable
fun SearchRoute(
    modifier: Modifier = Modifier,
    viewModel: SearchViewModel = hiltViewModel(),
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    SearchScreen(
        uiState = uiState,
        onQueryChange = viewModel::onQueryChange,
        onSearchSubmit = viewModel::onSearchSubmit,
        onTagClick = viewModel::onTagClick,
        onClearHistory = viewModel::onClearHistory,
        modifier = modifier,
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
internal fun SearchScreen(
    uiState: SearchUiState,
    onQueryChange: (String) -> Unit,
    onSearchSubmit: () -> Unit,
    onTagClick: (String) -> Unit,
    onClearHistory: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier = modifier.fillMaxSize()) {
        SearchBar(
            inputField = {
                SearchBarDefaults.InputField(
                    query = uiState.query,
                    onQueryChange = onQueryChange,
                    onSearch = { onSearchSubmit() },
                    expanded = false,
                    onExpandedChange = {},
                    placeholder = {
                        Text(text = stringResource(id = R.string.feature_search_placeholder))
                    },
                    leadingIcon = {
                        Icon(imageVector = Icons.Filled.Search, contentDescription = null)
                    },
                    trailingIcon = if (uiState.query.isNotEmpty()) {
                        {
                            IconButton(onClick = { onQueryChange("") }) {
                                Icon(imageVector = Icons.Filled.Close, contentDescription = null)
                            }
                        }
                    } else {
                        null
                    },
                )
            },
            expanded = false,
            onExpandedChange = {},
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp),
        ) {}

        if (uiState.query.isBlank()) {
            DiscoveryContent(
                history = uiState.history,
                onTagClick = onTagClick,
                onHistoryClick = onTagClick,
                onClearHistory = onClearHistory,
            )
        } else {
            ResultsContent(
                results = uiState.results,
                onRetry = onSearchSubmit,
            )
        }
    }
}

@Composable
private fun DiscoveryContent(
    history: List<String>,
    onTagClick: (String) -> Unit,
    onHistoryClick: (String) -> Unit,
    onClearHistory: () -> Unit,
) {
    val hotTags = listOf("Dashboard", "Report", "Settings", "Team", "Export", "Guide")
    LazyColumn(
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        item {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Filled.LocalFireDepartment,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary,
                )
                Spacer(modifier = Modifier.size(8.dp))
                Text(
                    text = stringResource(id = R.string.feature_search_hot_tags),
                    style = MaterialTheme.typography.titleMedium,
                )
            }
            Spacer(modifier = Modifier.height(12.dp))
            FlowChips(tags = hotTags, onTagClick = onTagClick)
        }

        if (history.isNotEmpty()) {
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Filled.History,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                        Spacer(modifier = Modifier.size(8.dp))
                        Text(
                            text = stringResource(id = R.string.feature_search_history),
                            style = MaterialTheme.typography.titleMedium,
                        )
                    }
                    TextButton(onClick = onClearHistory) {
                        Text(text = stringResource(id = R.string.feature_search_clear_history))
                    }
                }
                Spacer(modifier = Modifier.height(8.dp))
                Column {
                    history.forEach { term ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { onHistoryClick(term) }
                                .padding(vertical = 10.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Icon(
                                imageVector = Icons.Filled.History,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.size(20.dp),
                            )
                            Spacer(modifier = Modifier.size(12.dp))
                            Text(
                                text = term,
                                style = MaterialTheme.typography.bodyLarge,
                            )
                        }
                    }
                }
            }
        }
    }
}

@OptIn(androidx.compose.foundation.layout.ExperimentalLayoutApi::class)
@Composable
private fun FlowChips(
    tags: List<String>,
    onTagClick: (String) -> Unit,
) {
    androidx.compose.foundation.layout.FlowRow(
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        tags.forEach { tag ->
            FilterChip(
                selected = false,
                onClick = { onTagClick(tag) },
                label = { Text(text = tag) },
            )
        }
    }
}

@Composable
private fun ResultsContent(
    results: Result<List<SearchResultItem>>?,
    onRetry: () -> Unit,
) {
    when (results) {
        null, Result.Loading -> LoadingWheel()
        is Result.Error ->
            ErrorState(
                message = stringResource(id = R.string.feature_search_load_error),
                onRetry = onRetry,
            )
        is Result.Success ->
            if (results.data.isEmpty()) {
                EmptyState(
                    icon = Icons.Filled.SearchOff,
                    title = stringResource(id = R.string.feature_search_no_results),
                )
            } else {
                LazyColumn(
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    item {
                        Text(
                            text = stringResource(
                                id = R.string.feature_search_result_count,
                                results.data.size,
                            ),
                            style = MaterialTheme.typography.titleSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                    items(results.data, key = { it.id }) { item ->
                        ResultCard(item = item)
                    }
                }
            }
    }
}

@Composable
private fun ResultCard(item: SearchResultItem) {
    Surface(
        shape = RoundedCornerShape(16.dp),
        tonalElevation = 1.dp,
        modifier = Modifier.fillMaxWidth(),
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = item.title,
                style = MaterialTheme.typography.titleSmall,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = item.description,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
            )
        }
    }
}
