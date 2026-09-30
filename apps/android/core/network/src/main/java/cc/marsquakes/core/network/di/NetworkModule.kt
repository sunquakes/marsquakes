package cc.marsquakes.core.network.di

import cc.marsquakes.core.data.repository.AuthRepository
import cc.marsquakes.core.network.AccessTokenInterceptor
import cc.marsquakes.core.network.ApiService
import cc.marsquakes.core.network.BuildConfig
import cc.marsquakes.core.network.NetworkAuthDataSource
import cc.marsquakes.core.network.RemoteAuthRepository
import cc.marsquakes.core.network.RetrofitAuthDataSource
import com.jakewharton.retrofit2.converter.kotlinx.serialization.asConverterFactory
import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class NetworkModule {

    @Binds
    @Singleton
    abstract fun bindNetworkAuthDataSource(impl: RetrofitAuthDataSource): NetworkAuthDataSource

    @Binds
    @Singleton
    abstract fun bindAuthRepository(impl: RemoteAuthRepository): AuthRepository

    companion object {

        @Provides
        @Singleton
        fun provideJson(): Json = Json {
            ignoreUnknownKeys = true
            explicitNulls = false
        }

        @Provides
        @Singleton
        fun provideOkHttpClient(
            accessTokenInterceptor: AccessTokenInterceptor,
        ): OkHttpClient {
            val loggingInterceptor = HttpLoggingInterceptor().apply {
                level = if (BuildConfig.DEBUG) {
                    HttpLoggingInterceptor.Level.BODY
                } else {
                    HttpLoggingInterceptor.Level.NONE
                }
            }
            return OkHttpClient.Builder()
                .addInterceptor(accessTokenInterceptor)
                .addInterceptor(loggingInterceptor)
                .build()
        }

        @Provides
        @Singleton
        fun provideRetrofit(
            okHttpClient: OkHttpClient,
            json: Json,
        ): Retrofit {
            val contentType = "application/json".toMediaType()
            return Retrofit.Builder()
                    .baseUrl(BuildConfig.API_BASE_URL)
                    .client(okHttpClient)
                    .addConverterFactory(json.asConverterFactory(contentType))
                    .build()
        }

        @Provides
        @Singleton
        fun provideApiService(retrofit: Retrofit): ApiService =
            retrofit.create(ApiService::class.java)
    }
}
