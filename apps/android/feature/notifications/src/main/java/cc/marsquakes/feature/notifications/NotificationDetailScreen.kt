package cc.marsquakes.feature.notifications

import cc.marsquakes.core.common.result.Result
import cc.marsquakes.core.model.AppNotification
import cc.marsquakes.core.ui.component.EmptyState
import cc.marsquakes.core.ui.component.ErrorState
import cc.marsquakes.core.ui.component.LoadingWheel
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.NotificationsOff
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle

@Composable
fun NotificationDetailRoute(
    notificationId: String,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: NotificationsViewModel = hiltViewModel(),
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    NotificationDetailScreen(
        notificationsResult = uiState.notifications,
        notificationId = notificationId,
        onBack = onBack,
        modifier = modifier,
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
internal fun NotificationDetailScreen(
    notificationsResult: Result<List<AppNotification>>,
    notificationId: String,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val notification = (notificationsResult as? Result.Success)
        ?.data
        ?.firstOrNull { it.id == notificationId }

    Scaffold(
        modifier = modifier.fillMaxSize(),
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = notification?.title
                            ?: stringResource(id = R.string.feature_notifications_detail_title),
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = null,
                        )
                    }
                },
            )
        },
    ) { innerPadding ->
        val contentModifier = Modifier
            .padding(innerPadding)
            .fillMaxSize()

        when (notificationsResult) {
            Result.Loading -> LoadingWheel(modifier = contentModifier)
            is Result.Error ->
                ErrorState(
                    message = stringResource(id = R.string.feature_notifications_load_error),
                    modifier = contentModifier,
                )
            is Result.Success ->
                if (notification == null) {
                    EmptyState(
                        icon = Icons.Filled.NotificationsOff,
                        title = stringResource(id = R.string.feature_notifications_not_found),
                        modifier = contentModifier,
                    )
                } else {
                    Column(
                        modifier = contentModifier.padding(24.dp),
                    ) {
                        Text(
                            text = notification.title,
                            style = MaterialTheme.typography.headlineSmall,
                        )
                        Text(
                            text = notification.time,
                            style = MaterialTheme.typography.labelMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.padding(top = 8.dp),
                        )
                        Text(
                            text = notification.content,
                            style = MaterialTheme.typography.bodyLarge,
                            modifier = Modifier.padding(top = 20.dp),
                        )
                    }
                }
        }
    }
}
