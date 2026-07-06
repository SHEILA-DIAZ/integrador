package com.firesupportia.mobile.ui.features.onboarding.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.firesupportia.mobile.R
import com.firesupportia.mobile.data.local.session.SessionManager
import com.firesupportia.mobile.ui.features.onboarding.state.OnboardingEvent
import com.firesupportia.mobile.ui.features.onboarding.state.OnboardingPage
import com.firesupportia.mobile.ui.features.onboarding.state.OnboardingUiState
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class OnboardingViewModel @Inject constructor(
    private val sessionManager: SessionManager
) : ViewModel() {

    private val _uiState = MutableStateFlow(OnboardingUiState())
    val uiState: StateFlow<OnboardingUiState> = _uiState.asStateFlow()

    init {
        _uiState.update {
            it.copy(
                pages = listOf(
                    OnboardingPage(
                        id       = 1,
                        imageRes = R.drawable.onboarding01,
                        title    = "Donaciones que Salvan Vidas",
                        subtitle = "Tu apoyo llega directamente a las compañías de bomberos que más lo necesitan mediante nuestra IA de priorización."
                    ),
                    OnboardingPage(
                        id       = 2,
                        imageRes = R.drawable.onboarding02,
                        title    = "Transparencia Total",
                        subtitle = "Rastrea tu donación en tiempo real. Cada aporte es gestionado y validado directamente por las Compañías Administradoras de Bomberos."
                    ),
                    OnboardingPage(
                        id       = 3,
                        imageRes = R.drawable.onboarding03,
                        title    = "Únete a la Brigada",
                        subtitle = "Conectamos a ciudadanos y bomberos para responder juntos ante cualquier emergencia.",
                        isLast   = true
                    )
                )
            )
        }
    }

    fun onEvent(event: OnboardingEvent) {
        when (event) {
            is OnboardingEvent.NextPage -> {
                val current = _uiState.value.currentPage
                val total   = _uiState.value.pages.size
                if (current < total - 1) {
                    _uiState.update { it.copy(currentPage = current + 1) }
                } else {
                    complete()
                }
            }
            is OnboardingEvent.PreviousPage -> {
                val current = _uiState.value.currentPage
                if (current > 0) {
                    _uiState.update { it.copy(currentPage = current - 1) }
                }
            }
            is OnboardingEvent.Skip -> complete()
        }
    }

    private fun complete() {
        viewModelScope.launch {
            sessionManager.setOnboardingCompleted()
            _uiState.update { it.copy(isCompleted = true) }
        }
    }
}