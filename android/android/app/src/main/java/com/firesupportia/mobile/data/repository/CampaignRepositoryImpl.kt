package com.firesupportia.mobile.data.repository

import com.firesupportia.mobile.data.mapper.toDomain
import com.firesupportia.mobile.data.remote.api.CampaignApiService
import com.firesupportia.mobile.data.remote.network.ApiResult
import com.firesupportia.mobile.domain.model.Campaign
import com.firesupportia.mobile.domain.repository.CampaignRepository
import javax.inject.Inject

class CampaignRepositoryImpl @Inject constructor(
    private val apiService: CampaignApiService
) : BaseRepository(), CampaignRepository {

    override suspend fun getCampaigns(): ApiResult<List<Campaign>> {
        val result = safeApiCall { apiService.getCampaigns() }
        return when (result) {
            is ApiResult.Success -> ApiResult.Success(result.data.map { it.toDomain() })
            is ApiResult.Error -> ApiResult.Error(result.code, result.message)
            ApiResult.NetworkError -> ApiResult.NetworkError
            ApiResult.UnknownError -> ApiResult.UnknownError
        }
    }

    override suspend fun getCampaignById(id: String): ApiResult<Campaign> {
        val result = safeApiCall { apiService.getCampaignById(id) }
        return when (result) {
            is ApiResult.Success -> ApiResult.Success(result.data.toDomain())
            is ApiResult.Error -> ApiResult.Error(result.code, result.message)
            ApiResult.NetworkError -> ApiResult.NetworkError
            ApiResult.UnknownError -> ApiResult.UnknownError
        }
    }
}
