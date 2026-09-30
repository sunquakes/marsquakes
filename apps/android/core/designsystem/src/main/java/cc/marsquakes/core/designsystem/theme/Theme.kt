package cc.marsquakes.core.designsystem.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext

private val DarkColorScheme = darkColorScheme(
    primary = MarsCoral,
    onPrimary = MarsMaroon,
    primaryContainer = MarsMaroon,
    onPrimaryContainer = MarsCoralLightest,
    inversePrimary = MarsRed,
    secondary = MarsCoralLight,
    onSecondary = MarsMaroon,
    secondaryContainer = MarsGrey700,
    onSecondaryContainer = MarsCoralLighter,
    tertiary = MarsCoralLighter,
    onTertiary = MarsMaroon,
    tertiaryContainer = MarsMaroonDeep,
    onTertiaryContainer = MarsCoralLightest,
    background = MarsGrey900,
    onBackground = MarsGrey200,
    surface = MarsGrey900,
    onSurface = MarsGrey200,
    surfaceVariant = MarsGrey800,
    onSurfaceVariant = MarsCoralLightest,
    surfaceTint = MarsCoral,
    inverseSurface = MarsGrey200,
    inverseOnSurface = MarsGrey900,
    error = MarsCoralDarker,
    onError = White,
    errorContainer = MarsMaroon,
    onErrorContainer = MarsCoralLightest,
    outline = MarsGrey700,
    outlineVariant = MarsGrey800,
)

private val LightColorScheme = lightColorScheme(
    primary = MarsRed,
    onPrimary = White,
    primaryContainer = MarsRedWash,
    onPrimaryContainer = MarsRedDarkest,
    inversePrimary = MarsCoral,
    secondary = MarsRedLight,
    onSecondary = White,
    secondaryContainer = MarsGrey100,
    onSecondaryContainer = MarsRedDarker,
    tertiary = MarsRedLighter,
    onTertiary = White,
    tertiaryContainer = MarsRedWash,
    onTertiaryContainer = MarsRedDarkest,
    background = MarsGrey50,
    onBackground = MarsGrey900,
    surface = White,
    onSurface = MarsGrey900,
    surfaceVariant = MarsGrey100,
    onSurfaceVariant = MarsGrey700,
    surfaceTint = MarsRed,
    inverseSurface = MarsGrey900,
    inverseOnSurface = MarsGrey200,
    error = MarsRed,
    onError = White,
    errorContainer = MarsRedWash,
    onErrorContainer = MarsRedDarkest,
    outline = MarsGrey200,
    outlineVariant = MarsGrey100,
)

@Composable
fun MarsquakesTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }

        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
