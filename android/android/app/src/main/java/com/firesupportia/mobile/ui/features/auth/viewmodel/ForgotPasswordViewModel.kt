package com.firesupportia.mobile.ui.features.auth.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.firesupportia.mobile.data.remote.network.ApiResult
import com.firesupportia.mobile.domain.repository.AuthRepository
import com.firesupportia.mobile.domain.validation.AuthError
import com.firesupportia.mobile.domain.validation.EmailValidator
import com.firesupportia.mobile.domain.validation.ValidationResult
import com.firesupportia.mobile.ui.core.state.UiEvent
import com.firesupportia.mobile.ui.features.auth.state.ForgotPasswordEvent
import com.firesupportia.mobile.ui.features.auth.state.ForgotPasswordUiState
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ForgotPasswordViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(ForgotPasswordUiState())
    val uiState: StateFlow<ForgotPasswordUiState> = _uiState.asStateFlow()

    private val _uiEvent = Channel<UiEvent>()
    val uiEvent = _uiEvent.receiveAsFlow()

    private val emailValidator = EmailValidator()

    fun onEvent(event: ForgotPasswordEvent) {
        when (event) {
            is ForgotPasswordEvent.OnEmailChanged -> {
                _uiState.update { it.copy(email = event.email, emailError = null) }
            }
            is ForgotPasswordEvent.OnSendInstructionsClicked -> {
                if (!_uiState.value.isLoading) {
                    sendRecoveryEmail()
                }
            }
            is ForgotPasswordEvent.OnErrorDismissed -> {
                _uiState.update { it.copy(generalError = null) }
            }
            is ForgotPasswordEvent.OnNavigationHandled -> {
                // No hace nada por ahora ya que el estado es efímero
            }
        }
    }

    private fun sendRecoveryEmail() {
        val emailResult = emailValidator.validate(_uiState.value.email)

        if (emailResult is ValidationResult.Error) {
            _uiState.update { state ->
                state.copy(
                    emailError = (emailResult.error as? AuthError)?.toMessage() ?: "Error de validación"
                )
            }
            return
        }

        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, generalError = null) }
            
            val result = authRepository.sendRecoveryEmail(_uiState.value.email)
            
            _uiState.update { it.copy(isLoading = false) }

            when (result) {
                is ApiResult.Success -> {
                    _uiEvent.send(UiEvent.Navigate(""))
                }
                is ApiResult.Error -> {
                    _uiEvent.send(UiEvent.ShowSnackbar(result.message))
                }
                is ApiResult.NetworkError -> {
                    _uiEvent.send(UiEvent.ShowSnackbar("Error de red"))
                }
                is ApiResult.UnknownError -> {
                    _uiEvent.send(UiEvent.ShowSnackbar("Error inesperado"))
                }
            }
        }
    }

    private fun AuthError.toMessage(): String {
        return when (this) {
            is com.firesupportia.mobile.domain.validation.AuthError.FieldEmpty -> "Este campo es obligatorio"
            is com.firesupportia.mobile.domain.validation.AuthError.InvalidEmail -> "Correo electrónico inválido"
            else -> "Error de validación"
        }
    }
}
