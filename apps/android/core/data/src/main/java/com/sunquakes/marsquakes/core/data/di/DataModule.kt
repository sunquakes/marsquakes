package com.sunquakes.marsquakes.core.data.di

import com.sunquakes.marsquakes.core.data.repository.AlbumRepository
import com.sunquakes.marsquakes.core.data.repository.DefaultUserDataRepository
import com.sunquakes.marsquakes.core.data.repository.OfflineFirstAlbumRepository
import com.sunquakes.marsquakes.core.data.repository.UserDataRepository
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class DataModule {

    @Binds
    @Singleton
    abstract fun bindsAlbumRepository(impl: OfflineFirstAlbumRepository): AlbumRepository

    @Binds
    @Singleton
    abstract fun bindsUserDataRepository(impl: DefaultUserDataRepository): UserDataRepository
}
