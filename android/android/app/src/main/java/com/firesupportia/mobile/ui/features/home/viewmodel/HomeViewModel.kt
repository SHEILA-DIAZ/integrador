package com.firesupportia.mobile.ui.features.home.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.firesupportia.mobile.data.remote.network.ApiResult
import com.firesupportia.mobile.domain.repository.AuthRepository
import com.firesupportia.mobile.domain.repository.CampaignRepository
import com.firesupportia.mobile.ui.features.home.state.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val campaignRepository: CampaignRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    init {
        loadHomeData()
    }

    private fun loadHomeData() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            
            val user = authRepository.getCurrentUser()
            val campaignsResult = campaignRepository.getCampaigns()
            
            _uiState.update { state ->
                state.copy(
                    userName = user?.nombre ?: "Usuario",
                    campaigns = when (campaignsResult) {
                        is ApiResult.Success -> campaignsResult.data.map { 
                            CampaignItemState(
                                it.title, 
                                it.progress, 
                                "S/ ${String.format("%.2f", it.remainingAmount)} rest.", 
                                it.isUrgent
                            ) 
                        }
                        else -> emptyList()
                    },
                    totalDonated = "S/ 12,450.00", // Aún simulado hasta tener Donaciones
                    impactedLives = 42,
                    currentRank = "Oro",
                    recentActivity = listOf(
                        ActivityItemState("Donación de S/ 50.00", "Estación Sur · Hace 2m", ActivityType.DONATION),
                        ActivityItemState("¡Subiste a Rango Oro!", "Logro desbloqueado · Ayer", ActivityType.RANK_UP)
                    ),
                    isLoading = false
                )
            }
        }
    }
}
