package com.firesupportia.mobile.domain.usecase.auth

import com.firesupportia.mobile.domain.repository.AuthRepository

/**
 * Caso de uso para cerrar la sesión del usuario.
 */
class LogoutUseCase(
    private val repository: AuthRepository
) {
    suspend operator fun invoke() {
        repository.logout()
    }
}
