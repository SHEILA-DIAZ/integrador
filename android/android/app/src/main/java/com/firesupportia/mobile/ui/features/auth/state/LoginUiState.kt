package com.firesupportia.mobile.ui.features.auth.state

/**
 * Representación inmutable del estado de la pantalla de Login.
 */
data class LoginUiState(
    val email: String = "",
    val emailError: String? = null,
    val password: String = "",
    val passwordError: String? = null,
    val isLoading: Boolean = false,
    val errorMessage: String? = null
)
