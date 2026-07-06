package com.firesupportia.mobile.data.mapper

import com.firesupportia.mobile.data.remote.dto.CampaignDto
import com.firesupportia.mobile.domain.model.Campaign

fun CampaignDto.toDomain(): Campaign {
    return Campaign(
        id = id,
        title = titulo,
        description = descripcion,
        targetAmount = montoMeta,
        currentAmount = montoRecaudado,
        isUrgent = esUrgente,
        imageUrl = imagenUrl
    )
}
