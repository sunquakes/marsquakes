package cc.marsquakes.feature.home

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.AddCircle
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import cc.marsquakes.core.designsystem.theme.MarsRedDarkest
import cc.marsquakes.core.designsystem.theme.MarsRedLight

@Composable
fun HomeRoute(
    modifier: Modifier = Modifier,
    viewModel: HomeViewModel = hiltViewModel(),
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    HomeScreen(uiState = uiState, modifier = modifier)
}

@Composable
internal fun HomeScreen(
    uiState: HomeUiState,
    modifier: Modifier = Modifier,
) {
    LazyColumn(
        modifier = modifier.fillMaxWidth(),
        contentPadding = PaddingValues(bottom = 24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        item {
            GreetingHeader(nickname = uiState.nickname)
        }
        item {
            BannerCarousel()
        }
        item {
            StatCardRow()
        }
        item {
            SectionHeader(title = stringResource(id = R.string.feature_home_quick_actions))
            QuickActionGrid()
        }
        item {
            SectionHeader(title = stringResource(id = R.string.feature_home_recent_activity))
            RecentActivityList()
        }
    }
}

@Composable
private fun GreetingHeader(nickname: String) {
    Column(modifier = Modifier.padding(start = 16.dp, end = 16.dp, top = 16.dp)) {
        Text(
            text = if (nickname.isEmpty()) {
                stringResource(id = R.string.feature_home_hello_guest)
            } else {
                stringResource(id = R.string.feature_home_hello, nickname)
            },
            style = MaterialTheme.typography.headlineSmall,
        )
        Text(
            text = stringResource(id = R.string.feature_home_subtitle),
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

@Composable
private fun BannerCarousel() {
    val banners = listOf(
        stringResource(id = R.string.feature_home_banner_1_title) to
            stringResource(id = R.string.feature_home_banner_1_desc),
        stringResource(id = R.string.feature_home_banner_2_title) to
            stringResource(id = R.string.feature_home_banner_2_desc),
        stringResource(id = R.string.feature_home_banner_3_title) to
            stringResource(id = R.string.feature_home_banner_3_desc),
    )
    val pagerState = rememberPagerState(pageCount = { banners.size })
    Column(
        modifier = Modifier.padding(horizontal = 16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        HorizontalPager(state = pagerState) { page ->
            val (title, desc) = banners[page]
            Surface(
                shape = RoundedCornerShape(20.dp),
                modifier = Modifier.fillMaxWidth(),
            ) {
                Box(
                    modifier = Modifier
                        .background(
                            Brush.verticalGradient(
                                colors = listOf(MarsRedDarkest, MarsRedLight),
                            ),
                        )
                        .padding(20.dp)
                        .height(96.dp),
                ) {
                    Column(verticalArrangement = Arrangement.Center) {
                        Text(
                            text = title,
                            style = MaterialTheme.typography.titleLarge,
                            color = Color.White,
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = desc,
                            style = MaterialTheme.typography.bodyMedium,
                            color = Color.White.copy(alpha = 0.85f),
                            maxLines = 2,
                            overflow = TextOverflow.Ellipsis,
                        )
                    }
                }
            }
        }
        Spacer(modifier = Modifier.height(8.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            repeat(banners.size) { index ->
                val selected = pagerState.currentPage == index
                Box(
                    modifier = Modifier
                        .size(if (selected) 8.dp else 6.dp)
                        .background(
                            color = if (selected) {
                                MaterialTheme.colorScheme.primary
                            } else {
                                MaterialTheme.colorScheme.outlineVariant
                            },
                            shape = CircleShape,
                        ),
                )
            }
        }
    }
}

@Composable
private fun StatCardRow() {
    val stats = listOf(
        Triple("128", stringResource(id = R.string.feature_home_stat_1), Icons.Filled.Star),
        Triple("36", stringResource(id = R.string.feature_home_stat_2), Icons.Filled.Favorite),
        Triple("12", stringResource(id = R.string.feature_home_stat_3), Icons.Filled.Email),
    )
    Row(
        modifier = Modifier.padding(horizontal = 16.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        stats.forEach { (value, label, icon) ->
            Surface(
                shape = RoundedCornerShape(16.dp),
                tonalElevation = 1.dp,
                modifier = Modifier.weight(1f),
            ) {
                Column(
                    modifier = Modifier.padding(vertical = 16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary,
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = value,
                        style = MaterialTheme.typography.titleLarge,
                    )
                    Text(
                        text = label,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }
        }
    }
}

@Composable
private fun SectionHeader(title: String) {
    Text(
        text = title,
        style = MaterialTheme.typography.titleMedium,
        modifier = Modifier.padding(horizontal = 16.dp),
    )
}

@Composable
private fun QuickActionGrid() {
    val actions = listOf(
        stringResource(id = R.string.feature_home_action_1) to Icons.Filled.Search,
        stringResource(id = R.string.feature_home_action_2) to Icons.Filled.AddCircle,
        stringResource(id = R.string.feature_home_action_3) to Icons.Filled.DateRange,
        stringResource(id = R.string.feature_home_action_4) to Icons.Filled.Favorite,
    )
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        actions.forEach { (label, icon) ->
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier
                    .weight(1f)
                    .clickable { },
            ) {
                Box(
                    modifier = Modifier
                        .size(52.dp)
                        .background(
                            color = MaterialTheme.colorScheme.primaryContainer,
                            shape = RoundedCornerShape(16.dp),
                        ),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.onPrimaryContainer,
                    )
                }
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = label,
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
    }
}

@Composable
private fun RecentActivityList() {
    val activities = listOf(
        stringResource(id = R.string.feature_home_activity_1),
        stringResource(id = R.string.feature_home_activity_2),
        stringResource(id = R.string.feature_home_activity_3),
        stringResource(id = R.string.feature_home_activity_4),
    )
    Surface(
        shape = RoundedCornerShape(20.dp),
        tonalElevation = 1.dp,
        modifier = Modifier.padding(horizontal = 16.dp),
    ) {
        Column(modifier = Modifier.padding(vertical = 4.dp)) {
            activities.forEachIndexed { index, activity ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { }
                        .padding(horizontal = 16.dp, vertical = 14.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Box(
                        modifier = Modifier
                            .size(10.dp)
                            .background(
                                color = MaterialTheme.colorScheme.primary,
                                shape = CircleShape,
                            ),
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(
                        text = activity,
                        style = MaterialTheme.typography.bodyLarge,
                        modifier = Modifier.weight(1f),
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
                if (index != activities.lastIndex) {
                    Box(
                        modifier = Modifier
                            .padding(start = 38.dp)
                            .fillMaxWidth()
                            .height(1.dp)
                            .background(MaterialTheme.colorScheme.surfaceVariant),
                    )
                }
            }
        }
    }
}
