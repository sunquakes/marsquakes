package com.sunquakes.marsquakes.ui

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.selection.selectable
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.rememberNavController
import com.sunquakes.marsquakes.R
import com.sunquakes.marsquakes.core.designsystem.theme.MarsquakesTheme
import com.sunquakes.marsquakes.core.model.DarkThemeMode
import com.sunquakes.marsquakes.core.ui.component.MarsquakesTopAppBar
import com.sunquakes.marsquakes.feature.album.navigation.ALBUM_ROUTE
import com.sunquakes.marsquakes.feature.album.navigation.albumScreen

/**
 * The application shell: theme, top bar and the navigation graph.
 *
 * It deliberately owns no screen content — features are reached through
 * [androidx.navigation.NavGraphBuilder] extensions they each expose, so adding a feature is a
 * new module plus one line here instead of an edit to this file's body.
 */
@Composable
fun MarsquakesApp(viewModel: AppViewModel = hiltViewModel()) {
    val userPreferences by viewModel.userPreferences.collectAsStateWithLifecycle()
    var showAppearanceDialog by remember { mutableStateOf(false) }

    MarsquakesTheme(
        darkTheme = when (userPreferences.darkThemeMode) {
            DarkThemeMode.SYSTEM -> isSystemInDarkTheme()
            DarkThemeMode.LIGHT -> false
            DarkThemeMode.DARK -> true
        },
        dynamicColor = userPreferences.dynamicColor,
    ) {
        val navController = rememberNavController()

        Scaffold(
            modifier = Modifier.fillMaxSize(),
            topBar = {
                MarsquakesTopAppBar(
                    title = stringResource(R.string.app_name),
                    actions = {
                        TextButton(onClick = { showAppearanceDialog = true }) {
                            Text(text = stringResource(R.string.appearance))
                        }
                    },
                )
            },
        ) { innerPadding ->
            NavHost(
                navController = navController,
                startDestination = ALBUM_ROUTE,
                modifier = Modifier.padding(innerPadding),
            ) {
                albumScreen()
            }
        }

        if (showAppearanceDialog) {
            AppearanceDialog(
                themeMode = userPreferences.darkThemeMode,
                dynamicColor = userPreferences.dynamicColor,
                onThemeModeChange = viewModel::setDarkThemeMode,
                onDynamicColorChange = viewModel::setDynamicColor,
                onDismiss = { showAppearanceDialog = false },
            )
        }
    }
}

@Composable
private fun AppearanceDialog(
    themeMode: DarkThemeMode,
    dynamicColor: Boolean,
    onThemeModeChange: (DarkThemeMode) -> Unit,
    onDynamicColorChange: (Boolean) -> Unit,
    onDismiss: () -> Unit,
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(text = stringResource(R.string.appearance)) },
        text = {
            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Text(
                        text = stringResource(R.string.appearance_dynamic_color),
                        modifier = Modifier.weight(1f),
                    )
                    Switch(checked = dynamicColor, onCheckedChange = onDynamicColorChange)
                }

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = stringResource(R.string.appearance_theme),
                    style = MaterialTheme.typography.labelLarge,
                )

                DarkThemeMode.entries.forEach { mode ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .selectable(
                                selected = mode == themeMode,
                                role = Role.RadioButton,
                                onClick = { onThemeModeChange(mode) },
                            )
                            .padding(vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        RadioButton(selected = mode == themeMode, onClick = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(text = stringResource(mode.labelRes))
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text(text = stringResource(R.string.appearance_close))
            }
        },
    )
}

private val DarkThemeMode.labelRes: Int
    get() = when (this) {
        DarkThemeMode.SYSTEM -> R.string.appearance_theme_system
        DarkThemeMode.LIGHT -> R.string.appearance_theme_light
        DarkThemeMode.DARK -> R.string.appearance_theme_dark
    }
