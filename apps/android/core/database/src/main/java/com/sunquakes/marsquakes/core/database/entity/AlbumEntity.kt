package com.sunquakes.marsquakes.core.database.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.sunquakes.marsquakes.core.model.Album

@Entity(tableName = "albums")
data class AlbumEntity(
    @PrimaryKey val id: Long,
    val title: String,
    val artist: String,
    val coverUrl: String,
    val trackCount: Int,
    val releaseYear: Int,
)

fun AlbumEntity.asExternalModel(): Album = Album(
    id = id,
    title = title,
    artist = artist,
    coverUrl = coverUrl,
    trackCount = trackCount,
    releaseYear = releaseYear,
)

fun Album.asEntity(): AlbumEntity = AlbumEntity(
    id = id,
    title = title,
    artist = artist,
    coverUrl = coverUrl,
    trackCount = trackCount,
    releaseYear = releaseYear,
)
