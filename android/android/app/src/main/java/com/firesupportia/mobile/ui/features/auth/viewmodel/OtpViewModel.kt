package com.firesupportia.mobile.ui.features.auth.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.firesupportia.mobile.data.remote.network.ApiResult
import com.firesupportia.mobile.domain.repository.AuthRepository
import com.firesupportia.mobile.ui.core.state.UiEvent
import com.firesupportia.mobile.ui.features.auth.state.OtpEvent
import com.firesupportia.mobile.ui.features.auth.state.OtpUiState
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
class OtpViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(OtpUiState())
    val uiState: StateFlow<OtpUiState> = _uiState.asStateFlow()

    private val _uiEvent = Channel<UiEvent>()
    val uiEvent = _uiEvent.receiveAsFlow()

    fun onEvent(event: OtpEvent) {
        when (event) {
            is OtpEvent.OnDigitChanged -> {
                updateDigit(event.index, event.value)
            }
            is OtpEvent.OnVerifyClicked -> {
                if (!_uiState.value.isLoading) {
                    verifyCode()
                }
            }
            is OtpEvent.OnResendCodeClicked -> {
                // TODO: Implementar reenvío de código
            }
            is OtpEvent.OnNavigationHandled -> {
                // No hace nada por ahora ya que el estado es efímero
            }
        }
    }

    private fun updateDigit(index: Int, value: String) {
        if (value.length > 1) return
        _uiState.update {
            when (index) {
                0 -> it.copy(digit1 = value)
                1 -> it.copy(digit2 = value)
                2 -> it.copy(digit3 = value)
                3 -> it.copy(digit4 = value)
                else -> it
            }
        }
    }

    private fun verifyCode() {
        if (!_uiState.value.isOtpComplete) return

        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            
            // Reemplazamos el delay por la llamada al repositorio
            // Para el flujo de registro, deberíamos tener el email disponible.
            // Por ahora usamos un email dummy o lo extraemos de algún estado previo.
            val result = authRepository.verifyOtp("dummy@correo.com", _uiState.value.fullCode)
            
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
}
