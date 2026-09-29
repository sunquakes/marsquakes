package com.sunquakes.marsquakes.feature.album

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle

/**
 * The stateful half of the screen: it owns the ViewModel and hands plain data to
 * [AlbumScreen], which keeps the visual half previewable without Hilt.
 */
@Composable
internal fun AlbumRoute(
    modifier: Modifier = Modifier,
    viewModel: AlbumViewModel = hiltViewModel(),
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    AlbumScreen(
        uiState = uiState,
        onRefresh = viewModel::refresh,
        modifier = modifier,
    )
}
