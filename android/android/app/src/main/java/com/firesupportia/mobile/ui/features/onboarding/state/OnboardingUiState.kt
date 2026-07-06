package com.firesupportia.mobile.ui.features.onboarding.state

data class OnboardingPage(
    val id: Int,
    val imageRes: Int,
    val title: String,
    val subtitle: String,
    val isLast: Boolean = false
)

data class OnboardingUiState(
    val pages       : List<OnboardingPage> = emptyList(),
    val currentPage : Int                  = 0,
    val isCompleted : Boolean              = false
)