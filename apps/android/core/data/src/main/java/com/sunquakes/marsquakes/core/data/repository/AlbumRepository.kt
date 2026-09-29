package com.sunquakes.marsquakes.core.data.repository

import com.sunquakes.marsquakes.core.model.Album
import kotlinx.coroutines.flow.Flow

interface AlbumRepository {

    /**
     * The user's albums, observed from the local cache.
     *
     * The flow keeps emitting as the cache changes, which is what makes a successful
     * [sync] show up on screen without the caller asking for it again.
     */
    val albums: Flow<List<Album>>

    /** Refreshes the local cache from the network. Failure leaves the cache untouched. */
    suspend fun sync()
}
