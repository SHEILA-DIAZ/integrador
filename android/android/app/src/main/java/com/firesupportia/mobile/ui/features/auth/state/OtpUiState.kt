package com.firesupportia.mobile.ui.features.auth.state

data class OtpUiState(
    val digit1: String = "",
    val digit2: String = "",
    val digit3: String = "",
    val digit4: String = "",
    val isLoading: Boolean = false,
    val error: String? = null
) {
    val isOtpComplete: Boolean get() = digit1.length == 1 && digit2.length == 1 && digit3.length == 1 && digit4.length == 1
    val fullCode: String get() = "$digit1$digit2$digit3$digit4"
}
