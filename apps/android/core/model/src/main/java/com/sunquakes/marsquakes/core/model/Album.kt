package com.sunquakes.marsquakes.core.model

/**
 * An album as every other module understands it.
 *
 * Deliberately free of Room and Retrofit annotations: the database and the network layer each
 * keep their own representation and map into this type, which is what stops a schema or a
 * payload change from rippling into the UI.
 */
data class Album(
    val id: Long,
    val title: String,
    val artist: String,
    val coverUrl: String,
    val trackCount: Int,
    val releaseYear: Int,
)
