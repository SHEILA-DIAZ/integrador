package com.firesupportia.mobile.ui.features.auth.state

data class RegisterUiState(
    val name: String = "",
    val nameError: String? = null,
    val email: String = "",
    val emailError: String? = null,
    val password: String = "",
    val passwordError: String? = null,
    val confirmPassword: String = "",
    val confirmPasswordError: String? = null,
    val isTermsAccepted: Boolean = false,
    val termsError: String? = null,
    val isLoading: Boolean = false,
    val snackbarMessage: String? = null
)
