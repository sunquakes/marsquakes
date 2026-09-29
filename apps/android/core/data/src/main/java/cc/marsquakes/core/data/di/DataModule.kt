package cc.marsquakes.core.data.di

import cc.marsquakes.core.data.repository.DefaultUserDataRepository
import cc.marsquakes.core.data.repository.UserDataRepository
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
    abstract fun bindsUserDataRepository(impl: DefaultUserDataRepository): UserDataRepository
}
