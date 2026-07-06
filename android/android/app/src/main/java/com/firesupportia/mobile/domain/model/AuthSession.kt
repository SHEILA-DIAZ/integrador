package com.firesupportia.mobile.domain.model

/**
 * Representa una sesión de usuario activa en el dominio.
 */
data class AuthSession(
    val user: User,
    val token: String
)
