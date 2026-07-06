package com.firesupportia.mobile.domain.model

/**
 * Modelo de dominio para el Usuario.
 * Representa los datos esenciales para la lógica de la aplicación.
 */
data class User(
    val id: Int,
    val nombre: String,
    val email: String,
    val rol: String
)
