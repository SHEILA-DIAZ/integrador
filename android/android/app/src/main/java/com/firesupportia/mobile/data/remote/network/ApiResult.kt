package com.firesupportia.mobile.data.remote.network

import com.firesupportia.mobile.domain.validation.ValidationError

sealed interface ApiResult<out T> {
    data class Success<T>(
        val data: T
    ) : ApiResult<T>

    data class Error(
        val code: Int,
        val message: String
    ) : ApiResult<Nothing>

    data object NetworkError : ApiResult<Nothing>

    data object UnknownError : ApiResult<Nothing>
}
