package com.firesupportia.mobile.ui.features.auth.state

sealed interface RegisterEvent {
    data class OnNameChanged(val name: String) : RegisterEvent
    data class OnEmailChanged(val email: String) : RegisterEvent
    data class OnPasswordChanged(val password: String) : RegisterEvent
    data class OnConfirmPasswordChanged(val password: String) : RegisterEvent
    data class OnTermsAcceptedChanged(val accepted: Boolean) : RegisterEvent
    object OnRegisterClicked : RegisterEvent
    object OnSnackbarDismissed : RegisterEvent
}
