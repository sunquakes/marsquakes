package com.sunquakes.marsquakes.core.network.model

import com.sunquakes.marsquakes.core.model.Album
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * The wire representation of an album.
 *
 * Kept separate from [Album] so renaming a JSON field is a change here and nowhere else.
 */
@Serializable
data class NetworkAlbum(
    val id: Long,
    val title: String,
    val artist: String,
    @SerialName("cover_url") val coverUrl: String,
    @SerialName("track_count") val trackCount: Int,
    @SerialName("release_year") val releaseYear: Int,
)

fun NetworkAlbum.asExternalModel(): Album = Album(
    id = id,
    title = title,
    artist = artist,
    coverUrl = coverUrl,
    trackCount = trackCount,
    releaseYear = releaseYear,
)
