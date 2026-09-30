package cc.marsquakes.feature.home

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle

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
    LazyVerticalGrid(
        columns = GridCells.Fixed(2),
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item(span = { androidx.compose.foundation.lazy.grid.GridItemSpan(maxLineSpan) }) {
            GreetingHeader(nickname = uiState.nickname)
        }
        items(uiState.albums) { album ->
            AlbumCard(title = album)
        }
    }
}

@Composable
private fun GreetingHeader(nickname: String) {
    Column(modifier = Modifier.padding(top = 8.dp, bottom = 8.dp)) {
        Text(
            text = stringResource(id = R.string.feature_home_hello, nickname),
            style = MaterialTheme.typography.headlineSmall,
        )
        Text(
            text = stringResource(id = R.string.feature_home_subtitle),
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(top = 4.dp),
        )
    }
}

@Composable
private fun AlbumCard(title: String) {
    val palette = albumPalette(title)
    Card(
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = Color.Transparent),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        modifier = Modifier
            .fillMaxWidth()
            .height(150.dp),
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(colors = palette.toList()),
                ),
            contentAlignment = Alignment.BottomStart,
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(
                        Brush.verticalGradient(
                            colors = listOf(
                                Color.Transparent,
                                Color.Black.copy(alpha = 0.28f),
                            ),
                        ),
                    ),
            )
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
                color = Color.White,
                modifier = Modifier.padding(14.dp),
            )
        }
    }
}

private val albumPalettes: List<Pair<Color, Color>> = listOf(
    Color(0xFFB3312C) to Color(0xFF7D221E),
    Color(0xFFC25E4A) to Color(0xFF8F3B2B),
    Color(0xFFC9833E) to Color(0xFF935824),
    Color(0xFFB5973E) to Color(0xFF7E6824),
    Color(0xFF8C9E4B) to Color(0xFF5C6B2C),
    Color(0xFF5E9E7A) to Color(0xFF367054),
    Color(0xFF4A8C9E) to Color(0xFF2B5F6E),
    Color(0xFF5C6FA8) to Color(0xFF3A4773),
    Color(0xFF845C9E) to Color(0xFF56366E),
    Color(0xFFA85C7E) to Color(0xFF733752),
)

private fun albumPalette(title: String): Pair<Color, Color> =
    albumPalettes[title.hashCode().mod(albumPalettes.size)]
