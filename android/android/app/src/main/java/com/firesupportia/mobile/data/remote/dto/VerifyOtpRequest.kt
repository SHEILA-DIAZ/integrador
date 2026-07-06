package com.firesupportia.mobile.data.remote.dto

import com.google.gson.annotations.SerializedName

data class VerifyOtpRequest(
    @SerializedName("email") val email: String,
    @SerializedName("otp") val otp: String
)
