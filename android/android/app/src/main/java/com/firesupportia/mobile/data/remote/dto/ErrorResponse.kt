package com.firesupportia.mobile.data.remote.dto

import com.google.gson.annotations.SerializedName

data class ErrorResponse(
    @SerializedName("error") val error: String
)
