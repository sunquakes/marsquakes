package com.sunquakes.marsquakes.core.ui.component

import androidx.compose.foundation.layout.RowScope
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

/**
 * The app-level top bar.
 *
 * Takes the actions as a slot instead of naming them, because the actions belong to whichever
 * caller owns the screen — this module must not know what any feature puts here.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MarsquakesTopAppBar(
    title: String,
    modifier: Modifier = Modifier,
    actions: @Composable RowScope.() -> Unit = {},
) {
    TopAppBar(
        title = { Text(text = title) },
        modifier = modifier,
        actions = actions,
    )
}
