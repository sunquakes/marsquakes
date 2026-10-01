package cc.marsquakes.core.data.di

import cc.marsquakes.core.data.repository.DefaultNotificationsRepository
import cc.marsquakes.core.data.repository.DefaultSearchRepository
import cc.marsquakes.core.data.repository.DefaultUserDataRepository
import cc.marsquakes.core.data.repository.NotificationsRepository
import cc.marsquakes.core.data.repository.SearchRepository
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

    @Binds
    @Singleton
    abstract fun bindsNotificationsRepository(
        impl: DefaultNotificationsRepository,
    ): NotificationsRepository

    @Binds
    abstract fun bindsSearchRepository(impl: DefaultSearchRepository): SearchRepository
}
