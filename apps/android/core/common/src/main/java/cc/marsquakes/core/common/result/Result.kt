package cc.marsquakes.core.common.result

import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.map

sealed interface Result<out T> {
    data class Success<T>(val data: T) : Result<T>
    data class Error(val exception: Throwable) : Result<Nothing>
    data object Loading : Result<Nothing>
}

fun <T> kotlinx.coroutines.flow.Flow<T>.asResult(): kotlinx.coroutines.flow.Flow<Result<T>> =
    map<T, Result<T>> { Result.Success(it) }
        .catch { emit(Result.Error(it)) }
