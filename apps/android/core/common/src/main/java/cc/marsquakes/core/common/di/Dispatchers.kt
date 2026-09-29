package cc.marsquakes.core.common.di

import javax.inject.Qualifier

/**
 * Marks the [kotlinx.coroutines.CoroutineDispatcher] a collaborator expects.
 *
 * Injecting the dispatcher rather than reading [kotlinx.coroutines.Dispatchers] at the call
 * site is what lets a test swap in a deterministic one.
 */
@Qualifier
@Retention(AnnotationRetention.RUNTIME)
annotation class Dispatcher(val dispatcher: MarsquakesDispatcher)

enum class MarsquakesDispatcher {
    Default,
    IO,
}
