package com.sunquakes.marsquakes.core.network

import com.sunquakes.marsquakes.core.network.model.NetworkAlbum
import retrofit2.http.GET

interface MarsquakesApi {

    @GET("albums")
    suspend fun getAlbums(): List<NetworkAlbum>
}
