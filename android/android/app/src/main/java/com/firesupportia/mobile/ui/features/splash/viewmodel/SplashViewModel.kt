package com.firesupportia.mobile.ui.features.splash.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.firesupportia.mobile.domain.repository.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed interface SplashUiState {
    object Idle : SplashUiState
    object GoToHome : SplashUiState
    object GoToLogin : SplashUiState
    object GoToOnboarding : SplashUiState
}

@HiltViewModel
class SplashViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _state = MutableStateFlow<SplashUiState>(SplashUiState.Idle)
    val state: StateFlow<SplashUiState> = _state.asStateFlow()

    init {
        checkSession()
    }

    private fun checkSession() {
        viewModelScope.launch {
            try {
                if (authRepository.isLoggedIn()) {
                    if (authRepository.hasCompletedOnboarding()) {
                        _state.value = SplashUiState.GoToHome
                    } else {
                        _state.value = SplashUiState.GoToOnboarding
                    }
                } else {
                    _state.value = SplashUiState.GoToLogin
                }
            } catch (e: Exception) {
                // En caso de error crítico, mandamos a login por seguridad
                _state.value = SplashUiState.GoToLogin
            }
        }
    }
}
