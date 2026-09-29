package com.sunquakes.marsquakes.core.database.di

import android.content.Context
import androidx.room.Room
import com.sunquakes.marsquakes.core.database.MarsquakesDatabase
import com.sunquakes.marsquakes.core.database.dao.AlbumDao
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun providesMarsquakesDatabase(
        @ApplicationContext context: Context,
    ): MarsquakesDatabase = Room.databaseBuilder(
        context,
        MarsquakesDatabase::class.java,
        "marsquakes-database",
    ).build()

    @Provides
    fun providesAlbumDao(database: MarsquakesDatabase): AlbumDao = database.albumDao()
}
