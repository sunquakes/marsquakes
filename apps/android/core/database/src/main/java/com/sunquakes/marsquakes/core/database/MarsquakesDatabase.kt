package com.sunquakes.marsquakes.core.database

import androidx.room.Database
import androidx.room.RoomDatabase
import com.sunquakes.marsquakes.core.database.dao.AlbumDao
import com.sunquakes.marsquakes.core.database.entity.AlbumEntity

@Database(
    entities = [AlbumEntity::class],
    version = 1,
    exportSchema = true,
)
abstract class MarsquakesDatabase : RoomDatabase() {

    abstract fun albumDao(): AlbumDao
}
