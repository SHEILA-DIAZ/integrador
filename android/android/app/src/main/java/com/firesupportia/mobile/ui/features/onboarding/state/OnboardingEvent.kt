package com.firesupportia.mobile.ui.features.onboarding.state

sealed interface OnboardingEvent {
    data object NextPage : OnboardingEvent
    data object PreviousPage : OnboardingEvent
    data object Skip : OnboardingEvent
}