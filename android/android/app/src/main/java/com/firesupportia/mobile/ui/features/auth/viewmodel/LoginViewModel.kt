package com.firesupportia.mobile.ui.features.auth.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.firesupportia.mobile.data.remote.network.ApiResult
import com.firesupportia.mobile.domain.repository.AuthRepository
import com.firesupportia.mobile.domain.usecase.auth.GoogleLoginUseCase
import com.firesupportia.mobile.domain.usecase.auth.LoginUseCase
import com.firesupportia.mobile.domain.validation.*
import com.firesupportia.mobile.ui.core.state.UiEvent
import com.firesupportia.mobile.ui.features.auth.state.LoginEvent
import com.firesupportia.mobile.ui.features.auth.state.LoginUiState
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
class LoginViewModel @Inject constructor(
    private val loginUseCase: LoginUseCase,
    private val googleLoginUseCase: GoogleLoginUseCase,
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(LoginUiState())
    val uiState: StateFlow<LoginUiState> = _uiState.asStateFlow()

    private val _uiEvent = Channel<UiEvent>()
    val uiEvent = _uiEvent.receiveAsFlow()

    private val emailValidator = EmailValidator()
    private val passwordValidator = PasswordValidator()

    fun onEvent(event: LoginEvent) {
        when (event) {
            is LoginEvent.OnEmailChanged -> {
                _uiState.update { it.copy(email = event.email, emailError = null) }
            }
            is LoginEvent.OnPasswordChanged -> {
                _uiState.update { it.copy(password = event.password, passwordError = null) }
            }
            is LoginEvent.OnLoginClicked -> {
                if (!_uiState.value.isLoading) {
                    validateAndLogin()
                }
            }
            is LoginEvent.OnGoogleLoginSuccess -> {
                loginWithGoogle(event.credential)
            }
            is LoginEvent.OnClearForm -> {
                _uiState.update { LoginUiState() }
            }
            is LoginEvent.OnErrorDismissed -> {
                _uiState.update { it.copy(errorMessage = null) }
            }
        }
    }

    private fun validateAndLogin() {
        val emailResult = emailValidator.validate(_uiState.value.email)
        val passwordResult = passwordValidator.validate(_uiState.value.password)

        if (emailResult is ValidationResult.Error || passwordResult is ValidationResult.Error) {
            _uiState.update { state ->
                state.copy(
                    emailError = (emailResult as? ValidationResult.Error)?.error?.toMessage(),
                    passwordError = (passwordResult as? ValidationResult.Error)?.error?.toMessage()
                )
            }
            return
        }

        performLogin()
    }

    private fun performLogin() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }
            
            val result = loginUseCase(
                email = _uiState.value.email,
                password = _uiState.value.password
            )

            _uiState.update { it.copy(isLoading = false) }

            when (result) {
                is ApiResult.Success -> {
                    _uiEvent.send(UiEvent.Navigate(NavRoutes.ONBOARDING))
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

    private fun loginWithGoogle(credential: com.google.firebase.auth.AuthCredential) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }
            
            // 1. Obtener ID Token de Firebase
            val firebaseResult = googleLoginUseCase(credential)
            
            firebaseResult.fold(
                onSuccess = { idToken ->
                    // 2. Intercambiar por JWT del backend
                    val backendResult = authRepository.loginWithGoogle(idToken)
                    
                    _uiState.update { it.copy(isLoading = false) }
                    
                    when (backendResult) {
                        is ApiResult.Success -> {
                            _uiEvent.send(UiEvent.Navigate(NavRoutes.ONBOARDING))
                        }
                        is ApiResult.Error -> {
                            _uiEvent.send(UiEvent.ShowSnackbar(backendResult.message))
                        }
                        is ApiResult.NetworkError -> {
                            _uiEvent.send(UiEvent.ShowSnackbar("Error de red"))
                        }
                        is ApiResult.UnknownError -> {
                            _uiEvent.send(UiEvent.ShowSnackbar("Error inesperado"))
                        }
                    }
                },
                onFailure = { error ->
                    _uiState.update { it.copy(isLoading = false) }
                    _uiEvent.send(UiEvent.ShowSnackbar("Error en Firebase: ${error.message}"))
                }
            )
        }
    }

    private fun ValidationError.toMessage(): String {
        return when (this) {
            is AuthError.FieldEmpty -> "Este campo es obligatorio"
            is AuthError.InvalidEmail -> "Correo electrónico inválido"
            is AuthError.PasswordTooShort -> "La contraseña debe tener al menos 6 caracteres"
            else -> "Error de validación"
        }
    }
}
