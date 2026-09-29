package com.sunquakes.marsquakes.core.data.repository

import com.sunquakes.marsquakes.core.common.di.Dispatcher
import com.sunquakes.marsquakes.core.common.di.MarsquakesDispatcher
import com.sunquakes.marsquakes.core.database.dao.AlbumDao
import com.sunquakes.marsquakes.core.database.entity.asEntity
import com.sunquakes.marsquakes.core.database.entity.asExternalModel
import com.sunquakes.marsquakes.core.model.Album
import com.sunquakes.marsquakes.core.network.MarsquakesNetworkDataSource
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext
import retrofit2.HttpException
import java.io.IOException
import javax.inject.Inject

/**
 * Offline-first: the database is the single source of truth and the network is only a way of
 * refilling it. The UI therefore keeps working with no connection, and a sync failure is not
 * an error state — it just means the cached rows stay as they are.
 */
class OfflineFirstAlbumRepository @Inject constructor(
    private val albumDao: AlbumDao,
    private val networkDataSource: MarsquakesNetworkDataSource,
    @Dispatcher(MarsquakesDispatcher.IO) private val ioDispatcher: CoroutineDispatcher,
) : AlbumRepository {

    override val albums: Flow<List<Album>> = albumDao.observeAll()
        .map { entities -> entities.map { it.asExternalModel() } }

    override suspend fun sync() {
        withContext(ioDispatcher) {
            try {
                albumDao.upsertAll(networkDataSource.getAlbums().map { it.asEntity() })
            } catch (io: IOException) {
                // Being offline is an expected state here, not a failure to report.
            } catch (http: HttpException) {
                // A server-side refusal must not discard what the user already has cached.
            }
        }
    }
}
