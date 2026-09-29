package com.sunquakes.marsquakes.feature.album

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.sunquakes.marsquakes.core.designsystem.theme.MarsquakesTheme
import com.sunquakes.marsquakes.core.model.Album
import com.sunquakes.marsquakes.core.ui.component.LoadingWheel

@Composable
internal fun AlbumScreen(
    uiState: AlbumUiState,
    onRefresh: () -> Unit,
    modifier: Modifier = Modifier,
) {
    when {
        uiState.albums.isEmpty() && uiState.isLoading -> LoadingWheel(modifier)

        uiState.albums.isEmpty() -> AlbumEmptyState(
            onRefresh = onRefresh,
            modifier = modifier,
        )

        else -> AlbumList(
            albums = uiState.albums,
            onRefresh = onRefresh,
            modifier = modifier,
        )
    }
}

@Composable
private fun AlbumList(
    albums: List<Album>,
    onRefresh: () -> Unit,
    modifier: Modifier = Modifier,
) {
    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(vertical = 8.dp),
    ) {
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text = stringResource(R.string.album_count, albums.size),
                    style = MaterialTheme.typography.labelLarge,
                )
                TextButton(onClick = onRefresh) {
                    Text(text = stringResource(R.string.album_refresh))
                }
            }
        }

        items(items = albums, key = { it.id }) { album ->
            AlbumRow(album = album)
            HorizontalDivider()
        }
    }
}

@Composable
private fun AlbumRow(
    album: Album,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 12.dp),
    ) {
        Text(
            text = album.title,
            style = MaterialTheme.typography.titleMedium,
        )
        Text(
            text = stringResource(
                R.string.album_subtitle,
                album.artist,
                album.trackCount,
                album.releaseYear,
            ),
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

@Composable
private fun AlbumEmptyState(
    onRefresh: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(24.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(
            text = stringResource(R.string.album_empty_title),
            style = MaterialTheme.typography.titleMedium,
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = stringResource(R.string.album_empty_message),
            style = MaterialTheme.typography.bodyMedium,
            textAlign = TextAlign.Center,
        )
        Spacer(modifier = Modifier.height(16.dp))
        Button(onClick = onRefresh) {
            Text(text = stringResource(R.string.album_refresh))
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun AlbumScreenPreview() {
    MarsquakesTheme {
        AlbumScreen(
            uiState = AlbumUiState(
                albums = listOf(
                    Album(
                        id = 1,
                        title = "Ruby",
                        artist = "Marsquakes",
                        coverUrl = "",
                        trackCount = 12,
                        releaseYear = 2026,
                    ),
                ),
            ),
            onRefresh = {},
        )
    }
}
