package com.firesupportia.mobile.ui.features.auth.state

import com.google.firebase.auth.AuthCredential

/**
 * Eventos disparados desde la UI de Login hacia el ViewModel.
 */
sealed interface LoginEvent {
    data class OnEmailChanged(val email: String) : LoginEvent
    data class OnPasswordChanged(val password: String) : LoginEvent
    object OnLoginClicked : LoginEvent
    data class OnGoogleLoginSuccess(val credential: AuthCredential) : LoginEvent
    object OnClearForm : LoginEvent
    object OnErrorDismissed : LoginEvent
}
