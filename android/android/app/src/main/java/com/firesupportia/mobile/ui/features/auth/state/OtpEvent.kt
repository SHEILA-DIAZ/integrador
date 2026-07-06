package com.firesupportia.mobile.ui.features.auth.state

sealed interface OtpEvent {
    data class OnDigitChanged(val index: Int, val value: String) : OtpEvent
    object OnVerifyClicked : OtpEvent
    object OnResendCodeClicked : OtpEvent
    object OnNavigationHandled : OtpEvent
}
