package com.firesupportia.mobile.ui.core.state

/**
 * Eventos efímeros (One-time events) para la UI como navegación y snackbars.
 */
sealed interface UiEvent {
    data class ShowSnackbar(val message: String) : UiEvent
    object NavigateBack : UiEvent
    data class Navigate(val route: String) : UiEvent
}
