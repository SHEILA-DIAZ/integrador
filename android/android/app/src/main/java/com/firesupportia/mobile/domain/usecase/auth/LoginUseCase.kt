package com.firesupportia.mobile.domain.usecase.auth

import com.firesupportia.mobile.data.remote.network.ApiResult
import com.firesupportia.mobile.domain.model.AuthSession
import com.firesupportia.mobile.domain.repository.AuthRepository
import javax.inject.Inject

/**
 * Caso de uso para gestionar el inicio de sesión.
 */
class LoginUseCase @Inject constructor(
    private val repository: AuthRepository
) {
    suspend operator fun invoke(email: String, password: String): ApiResult<AuthSession> {
        return repository.login(email, password)
    }
}
