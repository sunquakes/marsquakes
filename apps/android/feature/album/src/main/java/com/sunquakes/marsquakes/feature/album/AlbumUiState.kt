package com.sunquakes.marsquakes.feature.album

import com.sunquakes.marsquakes.core.model.Album

data class AlbumUiState(
    val isLoading: Boolean = false,
    val albums: List<Album> = emptyList(),
)
