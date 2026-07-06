package com.firesupportia.mobile.ui.features.home.state

data class HomeUiState(
    val userName: String = "",
    val totalDonated: String = "S/ 0.00",
    val impactedLives: Int = 0,
    val currentRank: String = "Bronce",
    val campaigns: List<CampaignItemState> = emptyList(),
    val recentActivity: List<ActivityItemState> = emptyList(),
    val isLoading: Boolean = false,
    val errorMessage: String? = null
)

data class CampaignItemState(
    val title: String,
    val progress: Float,
    val amountRemaining: String,
    val isUrgent: Boolean
)

data class ActivityItemState(
    val title: String,
    val subtitle: String,
    val type: ActivityType
)

enum class ActivityType {
    DONATION, RANK_UP
}
