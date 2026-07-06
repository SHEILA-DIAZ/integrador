package com.firesupportia.mobile.domain.model

data class Campaign(
    val id: String,
    val title: String,
    val description: String,
    val targetAmount: Double,
    val currentAmount: Double,
    val isUrgent: Boolean,
    val imageUrl: String? = null
) {
    val progress: Float get() = if (targetAmount > 0) (currentAmount / targetAmount).toFloat() else 0f
    val remainingAmount: Double get() = (targetAmount - currentAmount).coerceAtLeast(0.0)
}
