package com.sunquakes.marsquakes.core.network

import com.sunquakes.marsquakes.core.common.di.Dispatcher
import com.sunquakes.marsquakes.core.common.di.MarsquakesDispatcher
import com.sunquakes.marsquakes.core.model.Album
import com.sunquakes.marsquakes.core.network.model.asExternalModel
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

/**
 * The app's only outbound HTTP surface.
 *
 * Returns core model types so callers never see a Retrofit or serialization type.
 */
@Singleton
class MarsquakesNetworkDataSource @Inject constructor(
    private val api: MarsquakesApi,
    @Dispatcher(MarsquakesDispatcher.IO) private val ioDispatcher: CoroutineDispatcher,
) {

    suspend fun getAlbums(): List<Album> = withContext(ioDispatcher) {
        api.getAlbums().map { it.asExternalModel() }
    }
}
