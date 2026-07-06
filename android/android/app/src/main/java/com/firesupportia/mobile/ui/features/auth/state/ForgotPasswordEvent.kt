package com.firesupportia.mobile.ui.features.auth.state

sealed interface ForgotPasswordEvent {
    data class OnEmailChanged(val email: String) : ForgotPasswordEvent
    object OnSendInstructionsClicked : ForgotPasswordEvent
    object OnErrorDismissed : ForgotPasswordEvent
    object OnNavigationHandled : ForgotPasswordEvent
}
