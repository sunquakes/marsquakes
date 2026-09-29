package cc.marsquakes.core.model

/**
 * The user-controlled settings this app persists.
 *
 * Every field carries a default so a fresh install renders correctly before anything has been
 * written to disk.
 */
data class UserPreferences(
    val darkThemeMode: DarkThemeMode = DarkThemeMode.SYSTEM,
    val dynamicColor: Boolean = true,
)

enum class DarkThemeMode {
    /** Follow the system setting. */
    SYSTEM,
    LIGHT,
    DARK,
}
