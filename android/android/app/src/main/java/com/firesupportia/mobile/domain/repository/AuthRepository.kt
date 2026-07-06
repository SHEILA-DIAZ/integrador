package com.firesupportia.mobile.domain.repository

import com.firesupportia.mobile.data.remote.network.ApiResult
import com.firesupportia.mobile.domain.model.AuthSession
import com.firesupportia.mobile.domain.model.User

interface AuthRepository {

    suspend fun login(
        email: String,
        password: String
    ): ApiResult<AuthSession>

    suspend fun loginWithGoogle(
        idToken: String
    ): ApiResult<AuthSession>

    suspend fun register(
        nombre: String,
        email: String,
        password: String
    ): ApiResult<Unit>

    suspend fun sendRecoveryEmail(
        email: String
    ): ApiResult<Unit>

    suspend fun verifyOtp(
        email: String,
        otp: String
    ): ApiResult<Unit>

    suspend fun resetPassword(
        email: String,
        otp: String,
        newPassword: String
    ): ApiResult<Unit>

    suspend fun logout()

    suspend fun isLoggedIn(): Boolean

    suspend fun hasCompletedOnboarding(): Boolean

    suspend fun getCurrentUser(): User?
}
