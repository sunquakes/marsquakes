package com.sunquakes.marsquakes.core.network

/**
 * Base URL of the Marsquakes backend.
 *
 * A constant rather than a `buildConfigField` so this module stays free of build-variant
 * plumbing; move it to `BuildConfig` once per-flavour endpoints exist.
 */
const val BASE_URL: String = "https://api.marsquakes.example.com/"
