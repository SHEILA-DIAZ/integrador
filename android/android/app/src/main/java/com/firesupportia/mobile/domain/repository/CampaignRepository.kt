package com.firesupportia.mobile.domain.repository

import com.firesupportia.mobile.data.remote.network.ApiResult
import com.firesupportia.mobile.domain.model.Campaign

interface CampaignRepository {
    suspend fun getCampaigns(): ApiResult<List<Campaign>>
    suspend fun getCampaignById(id: String): ApiResult<Campaign>
}
