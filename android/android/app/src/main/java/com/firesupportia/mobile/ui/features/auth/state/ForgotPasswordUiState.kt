package com.firesupportia.mobile.ui.features.auth.state

data class ForgotPasswordUiState(
    val email: String = "",
    val emailError: String? = null,
    val isLoading: Boolean = false,
    val generalError: String? = null
)
