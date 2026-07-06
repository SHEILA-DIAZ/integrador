package com.firesupportia.mobile.data.repository

import com.firesupportia.mobile.data.remote.dto.ErrorResponse
import com.firesupportia.mobile.data.remote.network.ApiResult
import com.google.gson.Gson
import retrofit2.Response
import java.io.IOException

abstract class BaseRepository {

    protected suspend fun <T> safeApiCall(
        apiCall: suspend () -> Response<T>
    ): ApiResult<T> {
        return try {
            val response = apiCall()
            val body = response.body()

            if (response.isSuccessful && body != null) {
                ApiResult.Success(body)
            } else {
                val errorMsg = try {
                    val errorBody = response.errorBody()?.string()
                    Gson().fromJson(errorBody, ErrorResponse::class.java).error
                } catch (e: Exception) {
                    "Error desconocido en el servidor"
                }
                ApiResult.Error(code = response.code(), message = errorMsg)
            }
        } catch (e: IOException) {
            ApiResult.NetworkError
        } catch (e: Exception) {
            ApiResult.UnknownError
        }
    }
}
