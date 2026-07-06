package com.firesupportia.mobile.data.repository

import com.firesupportia.mobile.data.local.session.SessionManager
import com.firesupportia.mobile.data.mapper.toDomain
import com.firesupportia.mobile.data.remote.api.AuthApiService
import com.firesupportia.mobile.data.remote.dto.*
import com.firesupportia.mobile.data.remote.network.ApiResult
import com.firesupportia.mobile.domain.model.AuthSession
import com.firesupportia.mobile.domain.model.User
import com.firesupportia.mobile.domain.repository.AuthRepository
import kotlinx.coroutines.flow.first
import javax.inject.Inject

class AuthRepositoryImpl @Inject constructor(
    private val sessionManager: SessionManager,
    private val apiService: AuthApiService
) : BaseRepository(), AuthRepository {

    override suspend fun login(email: String, password: String): ApiResult<AuthSession> {
        val request = LoginRequest(email, password)
        val result = safeApiCall { apiService.login(request) }

        return when (result) {
            is ApiResult.Success -> {
                val dto = result.data
                val session = AuthSession(
                    user = dto.usuario.toDomain(),
                    token = dto.token
                )
                sessionManager.saveSession(session)
                ApiResult.Success(session)
            }
            is ApiResult.Error -> ApiResult.Error(result.code, result.message)
            ApiResult.NetworkError -> ApiResult.NetworkError
            ApiResult.UnknownError -> ApiResult.UnknownError
        }
    }

    override suspend fun loginWithGoogle(idToken: String): ApiResult<AuthSession> {
        val request = GoogleLoginRequest(idToken)
        val result = safeApiCall { apiService.loginWithGoogle(request) }

        return when (result) {
            is ApiResult.Success -> {
                val dto = result.data
                val session = AuthSession(
                    user = dto.usuario.toDomain(),
                    token = dto.token
                )
                sessionManager.saveSession(session)
                ApiResult.Success(session)
            }
            is ApiResult.Error -> ApiResult.Error(result.code, result.message)
            ApiResult.NetworkError -> ApiResult.NetworkError
            ApiResult.UnknownError -> ApiResult.UnknownError
        }
    }

    override suspend fun register(nombre: String, email: String, password: String): ApiResult<Unit> {
        val request = RegisterRequest(nombre, email, password)
        val result = safeApiCall { apiService.register(request) }

        return when (result) {
            is ApiResult.Success -> ApiResult.Success(Unit)
            is ApiResult.Error -> ApiResult.Error(result.code, result.message)
            ApiResult.NetworkError -> ApiResult.NetworkError
            ApiResult.UnknownError -> ApiResult.UnknownError
        }
    }

    override suspend fun sendRecoveryEmail(email: String): ApiResult<Unit> {
        val request = ForgotPasswordRequest(email)
        val result = safeApiCall { apiService.forgotPassword(request) }
        return when (result) {
            is ApiResult.Success -> ApiResult.Success(Unit)
            is ApiResult.Error -> ApiResult.Error(result.code, result.message)
            ApiResult.NetworkError -> ApiResult.NetworkError
            ApiResult.UnknownError -> ApiResult.UnknownError
        }
    }

    override suspend fun verifyOtp(email: String, otp: String): ApiResult<Unit> {
        val request = VerifyOtpRequest(email, otp)
        val result = safeApiCall { apiService.verifyOtp(request) }
        return when (result) {
            is ApiResult.Success -> ApiResult.Success(Unit)
            is ApiResult.Error -> ApiResult.Error(result.code, result.message)
            ApiResult.NetworkError -> ApiResult.NetworkError
            ApiResult.UnknownError -> ApiResult.UnknownError
        }
    }

    override suspend fun resetPassword(email: String, otp: String, newPassword: String): ApiResult<Unit> {
        val request = ResetPasswordRequest(email, otp, newPassword)
        val result = safeApiCall { apiService.resetPassword(request) }
        return when (result) {
            is ApiResult.Success -> ApiResult.Success(Unit)
            is ApiResult.Error -> ApiResult.Error(result.code, result.message)
            ApiResult.NetworkError -> ApiResult.NetworkError
            ApiResult.UnknownError -> ApiResult.UnknownError
        }
    }

    override suspend fun logout() {
        sessionManager.clearSession()
    }

    override suspend fun isLoggedIn(): Boolean {
        return sessionManager.isUserLoggedIn().first()
    }

    override suspend fun hasCompletedOnboarding(): Boolean {
        return sessionManager.onboardingCompleted.first()
    }

    override suspend fun getCurrentUser(): User? {
        return sessionManager.getUser().first()
    }
}
