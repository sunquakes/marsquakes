package cc.marsquakes.feature.settings

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ExitToApp
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.Book
import androidx.compose.material.icons.filled.Cached
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Palette
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import cc.marsquakes.core.designsystem.theme.MarsRedDarkest
import cc.marsquakes.core.designsystem.theme.MarsRedLight
import cc.marsquakes.core.model.DarkThemeMode
import kotlinx.coroutines.launch

@Composable
fun SettingsRoute(
    modifier: Modifier = Modifier,
    viewModel: SettingsViewModel = hiltViewModel(),
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    SettingsScreen(
        uiState = uiState,
        onThemeModeChange = viewModel::setDarkThemeMode,
        onDynamicColorChange = viewModel::setDynamicColor,
        onPushChange = viewModel::setPushEnabled,
        onEmailChange = viewModel::setEmailEnabled,
        onLogout = viewModel::logout,
        modifier = modifier,
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
internal fun SettingsScreen(
    uiState: SettingsUiState,
    onThemeModeChange: (DarkThemeMode) -> Unit,
    onDynamicColorChange: (Boolean) -> Unit,
    onPushChange: (Boolean) -> Unit,
    onEmailChange: (Boolean) -> Unit,
    onLogout: () -> Unit,
    modifier: Modifier = Modifier,
) {
    var showAppearanceDialog by remember { mutableStateOf(false) }
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()

    Scaffold(
        modifier = modifier.fillMaxSize(),
        topBar = {
            TopAppBar(
                title = { Text(text = stringResource(id = R.string.feature_settings_title)) },
            )
        },
        snackbarHost = { SnackbarHost(hostState = snackbarHostState) },
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .padding(innerPadding)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            AccountCard(
                nickname = uiState.user?.nickname ?: "",
                username = uiState.user?.username ?: "",
            )

            SettingsGroup(title = stringResource(id = R.string.feature_settings_group_preferences)) {
                SettingEntry(
                    icon = Icons.Filled.Palette,
                    label = stringResource(id = R.string.feature_settings_appearance),
                    trailing = { ChevronIcon() },
                    onClick = { showAppearanceDialog = true },
                )
            }

            SettingsGroup(title = stringResource(id = R.string.feature_settings_group_notifications)) {
                SwitchEntry(
                    icon = Icons.Filled.Notifications,
                    label = stringResource(id = R.string.feature_settings_push),
                    checked = uiState.pushEnabled,
                    onCheckedChange = onPushChange,
                )
                SwitchEntry(
                    icon = Icons.Filled.Email,
                    label = stringResource(id = R.string.feature_settings_email),
                    checked = uiState.emailEnabled,
                    onCheckedChange = onEmailChange,
                )
            }

            SettingsGroup(title = stringResource(id = R.string.feature_settings_group_storage)) {
                SettingEntry(
                    icon = Icons.Filled.Cached,
                    label = stringResource(id = R.string.feature_settings_clear_cache),
                    trailing = {
                        Text(
                            text = "24 MB",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    },
                    onClick = {
                        scope.launch {
                            snackbarHostState.showSnackbar(
                                message = "Cache cleared",
                            )
                        }
                    },
                )
            }

            SettingsGroup(title = stringResource(id = R.string.feature_settings_group_about)) {
                SettingEntry(
                    icon = Icons.Filled.Info,
                    label = stringResource(id = R.string.feature_settings_version),
                    trailing = {
                        Text(
                            text = "1.0.0",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    },
                    onClick = {},
                )
                SettingEntry(
                    icon = Icons.Filled.Book,
                    label = stringResource(id = R.string.feature_settings_terms),
                    trailing = { ChevronIcon() },
                    onClick = {},
                )
            }

            LogoutButton(onClick = onLogout)
        }
    }

    if (showAppearanceDialog) {
        AppearanceDialog(
            themeMode = uiState.darkThemeMode,
            dynamicColor = uiState.dynamicColor,
            onThemeModeChange = onThemeModeChange,
            onDynamicColorChange = onDynamicColorChange,
            onDismiss = { showAppearanceDialog = false },
        )
    }
}

@Composable
private fun AccountCard(
    nickname: String,
    username: String,
) {
    Surface(
        shape = RoundedCornerShape(20.dp),
        modifier = Modifier.fillMaxWidth(),
    ) {
        Box(
            modifier = Modifier.background(
                Brush.verticalGradient(
                    colors = listOf(MarsRedDarkest, MarsRedLight),
                ),
            ),
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(20.dp),
            ) {
                Box(
                    modifier = Modifier
                        .size(56.dp)
                        .background(
                            color = Color.White.copy(alpha = 0.18f),
                            shape = CircleShape,
                        ),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(
                        imageVector = Icons.Filled.Person,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(30.dp),
                    )
                }
                Spacer(modifier = Modifier.width(16.dp))
                Column {
                    Text(
                        text = nickname.ifEmpty {
                            stringResource(id = R.string.feature_settings_guest)
                        },
                        style = MaterialTheme.typography.titleLarge,
                        color = Color.White,
                    )
                    if (username.isNotEmpty()) {
                        Text(
                            text = username,
                            style = MaterialTheme.typography.bodyMedium,
                            color = Color.White.copy(alpha = 0.85f),
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun SettingsGroup(
    title: String,
    content: @Composable () -> Unit,
) {
    Column {
        Text(
            text = title,
            style = MaterialTheme.typography.labelLarge,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(bottom = 8.dp, start = 4.dp),
        )
        Surface(
            shape = RoundedCornerShape(20.dp),
            tonalElevation = 1.dp,
            modifier = Modifier.fillMaxWidth(),
        ) {
            Column(modifier = Modifier.padding(vertical = 4.dp)) {
                content()
            }
        }
    }
}

@Composable
private fun SettingEntry(
    icon: ImageVector,
    label: String,
    trailing: @Composable () -> Unit,
    onClick: () -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(horizontal = 16.dp, vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            EntryIcon(icon = icon)
            Spacer(modifier = Modifier.width(14.dp))
            Text(text = label, style = MaterialTheme.typography.bodyLarge)
        }
        trailing()
    }
}

@Composable
private fun SwitchEntry(
    icon: ImageVector,
    label: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            EntryIcon(icon = icon)
            Spacer(modifier = Modifier.width(14.dp))
            Text(text = label, style = MaterialTheme.typography.bodyLarge)
        }
        Switch(checked = checked, onCheckedChange = onCheckedChange)
    }
}

@Composable
private fun EntryIcon(icon: ImageVector) {
    Box(
        modifier = Modifier
            .size(36.dp)
            .background(
                color = MaterialTheme.colorScheme.primaryContainer,
                shape = RoundedCornerShape(10.dp),
            ),
        contentAlignment = Alignment.Center,
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.onPrimaryContainer,
            modifier = Modifier.size(20.dp),
        )
    }
}

@Composable
private fun ChevronIcon() {
    Icon(
        imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
        contentDescription = null,
        tint = MaterialTheme.colorScheme.onSurfaceVariant,
    )
}

@Composable
private fun LogoutButton(onClick: () -> Unit) {
    Surface(
        onClick = onClick,
        shape = RoundedCornerShape(16.dp),
        color = MaterialTheme.colorScheme.errorContainer,
        modifier = Modifier
            .fillMaxWidth()
            .height(52.dp),
    ) {
        Row(
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Icon(
                imageVector = Icons.AutoMirrored.Filled.ExitToApp,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onErrorContainer,
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = stringResource(id = R.string.feature_settings_logout),
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.onErrorContainer,
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
        title = { Text(text = stringResource(id = R.string.feature_settings_appearance)) },
        text = {
            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Text(
                        text = stringResource(id = R.string.feature_settings_dynamic_color),
                        modifier = Modifier.weight(1f),
                    )
                    Switch(checked = dynamicColor, onCheckedChange = onDynamicColorChange)
                }

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = stringResource(id = R.string.feature_settings_theme),
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
                        Text(text = stringResource(id = mode.labelRes))
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text(text = stringResource(id = R.string.feature_settings_close))
            }
        },
    )
}

private val DarkThemeMode.labelRes: Int
    get() = when (this) {
        DarkThemeMode.SYSTEM -> R.string.feature_settings_theme_system
        DarkThemeMode.LIGHT -> R.string.feature_settings_theme_light
        DarkThemeMode.DARK -> R.string.feature_settings_theme_dark
    }
