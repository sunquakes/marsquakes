package com.sunquakes.marsquakes.core.database.dao

import androidx.room.Dao
import androidx.room.Query
import androidx.room.Upsert
import com.sunquakes.marsquakes.core.database.entity.AlbumEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface AlbumDao {

    @Query("SELECT * FROM albums ORDER BY title ASC")
    fun observeAll(): Flow<List<AlbumEntity>>

    @Upsert
    suspend fun upsertAll(albums: List<AlbumEntity>)
}
