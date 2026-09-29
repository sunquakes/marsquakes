package com.sunquakes.marsquakes.feature.album.navigation

import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.composable
import com.sunquakes.marsquakes.feature.album.AlbumRoute

const val ALBUM_ROUTE = "album"

fun NavGraphBuilder.albumScreen() {
    composable(route = ALBUM_ROUTE) {
        AlbumRoute()
    }
}
