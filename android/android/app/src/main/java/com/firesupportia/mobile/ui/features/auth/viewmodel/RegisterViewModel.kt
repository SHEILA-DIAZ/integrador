package com.firesupportia.mobile.ui.features.auth.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.firesupportia.mobile.data.remote.network.ApiResult
import com.firesupportia.mobile.domain.usecase.auth.RegisterUseCase
import com.firesupportia.mobile.domain.validation.*
import com.firesupportia.mobile.ui.core.state.UiEvent
import com.firesupportia.mobile.ui.features.auth.state.RegisterEvent
import com.firesupportia.mobile.ui.features.auth.state.RegisterUiState
import com.firesupportia.mobile.ui.navigation.NavRoutes
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
class RegisterViewModel @Inject constructor(
    private val registerUseCase: RegisterUseCase
) : ViewModel() {

    private val _uiState = MutableStateFlow(RegisterUiState())
    val uiState: StateFlow<RegisterUiState> = _uiState.asStateFlow()

    private val _uiEvent = Channel<UiEvent>()
    val uiEvent = _uiEvent.receiveAsFlow()

    private val nameValidator = NameValidator()
    private val emailValidator = EmailValidator()
    private val passwordValidator = PasswordValidator()

    fun onEvent(event: RegisterEvent) {
        when (event) {
            is RegisterEvent.OnNameChanged -> {
                _uiState.update { it.copy(name = event.name, nameError = null) }
            }
            is RegisterEvent.OnEmailChanged -> {
                _uiState.update { it.copy(email = event.email, emailError = null) }
            }
            is RegisterEvent.OnPasswordChanged -> {
                _uiState.update { it.copy(password = event.password, passwordError = null) }
            }
            is RegisterEvent.OnConfirmPasswordChanged -> {
                _uiState.update { it.copy(confirmPassword = event.password, confirmPasswordError = null) }
            }
            is RegisterEvent.OnTermsAcceptedChanged -> {
                _uiState.update { it.copy(isTermsAccepted = event.accepted, termsError = null) }
            }
            is RegisterEvent.OnRegisterClicked -> {
                if (!_uiState.value.isLoading) {
                    validateAndRegister()
                }
            }
            is RegisterEvent.OnSnackbarDismissed -> {
                _uiState.update { it.copy(snackbarMessage = null) }
            }
        }
    }

    private fun validateAndRegister() {
        val nameResult = nameValidator.validate(_uiState.value.name)
        val emailResult = emailValidator.validate(_uiState.value.email)
        val passwordResult = passwordValidator.validate(_uiState.value.password)
        
        val passwordsMatch = _uiState.value.password == _uiState.value.confirmPassword
        val termsAccepted = _uiState.value.isTermsAccepted

        if (nameResult is ValidationResult.Error || 
            emailResult is ValidationResult.Error || 
            passwordResult is ValidationResult.Error || 
            !passwordsMatch || !termsAccepted) {
            
            _uiState.update { state ->
                state.copy(
                    nameError = (nameResult as? ValidationResult.Error)?.error?.toMessage(),
                    emailError = (emailResult as? ValidationResult.Error)?.error?.toMessage(),
                    passwordError = (passwordResult as? ValidationResult.Error)?.error?.toMessage(),
                    confirmPasswordError = if (!passwordsMatch) "Las contraseñas no coinciden" else null,
                    termsError = if (!termsAccepted) "Debes aceptar los términos" else null
                )
            }
            return
        }

        performRegister()
    }

    private fun performRegister() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, snackbarMessage = null) }
            
            val result = registerUseCase(
                nombre = _uiState.value.name,
                email = _uiState.value.email,
                password = _uiState.value.password
            )

            _uiState.update { it.copy(isLoading = false) }

            when (result) {
                is ApiResult.Success -> {
                    _uiEvent.send(UiEvent.Navigate(NavRoutes.OTP_VERIFICATION))
                }
                is ApiResult.Error -> {
                    _uiEvent.send(UiEvent.ShowSnackbar(result.message))
                }
                is ApiResult.NetworkError -> {
                    _uiEvent.send(UiEvent.ShowSnackbar("Error de red. Verifica tu conexión."))
                }
                is ApiResult.UnknownError -> {
                    _uiEvent.send(UiEvent.ShowSnackbar("Ocurrió un error inesperado."))
                }
            }
        }
    }

    private fun ValidationError.toMessage(): String {
        return when (this) {
            is AuthError.FieldEmpty -> "Este campo es obligatorio"
            is AuthError.InvalidEmail -> "Correo electrónico inválido"
            is AuthError.PasswordTooShort -> "Mínimo 6 caracteres"
            is AuthError.InputTooShort -> "Nombre demasiado corto"
            else -> "Error de validación"
        }
    }
}
