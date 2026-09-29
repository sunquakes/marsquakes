package com.sunquakes.marsquakes.feature.album

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sunquakes.marsquakes.core.data.repository.AlbumRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class AlbumViewModel @Inject constructor(
    private val albumRepository: AlbumRepository,
) : ViewModel() {

    private val isLoading = MutableStateFlow(false)

    val uiState: StateFlow<AlbumUiState> = combine(
        albumRepository.albums,
        isLoading,
    ) { albums, loading ->
        AlbumUiState(isLoading = loading, albums = albums)
    }.stateIn(
        scope = viewModelScope,
        // Keep the cached value across a rotation instead of re-reading the database.
        started = SharingStarted.WhileSubscribed(STOP_TIMEOUT_MILLIS),
        initialValue = AlbumUiState(isLoading = true),
    )

    init {
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            isLoading.value = true
            albumRepository.sync()
            isLoading.value = false
        }
    }

    private companion object {
        const val STOP_TIMEOUT_MILLIS = 5_000L
    }
}
