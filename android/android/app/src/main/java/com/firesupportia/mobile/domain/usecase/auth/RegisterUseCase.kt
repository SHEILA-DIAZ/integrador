package com.firesupportia.mobile.domain.usecase.auth

import com.firesupportia.mobile.data.remote.network.ApiResult
import com.firesupportia.mobile.domain.repository.AuthRepository
import javax.inject.Inject

/**
 * Caso de uso para gestionar el registro de un nuevo usuario.
 */
class RegisterUseCase @Inject constructor(
    private val repository: AuthRepository
) {
    suspend operator fun invoke(nombre: String, email: String, password: String): ApiResult<Unit> {
        return repository.register(nombre, email, password)
    }
}
