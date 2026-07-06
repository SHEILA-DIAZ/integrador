package com.firesupportia.mobile.data.remote.api

import com.firesupportia.mobile.data.remote.dto.CampaignDto
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Path

interface CampaignApiService {

    @GET("campaigns")
    suspend fun getCampaigns(): Response<List<CampaignDto>>

    @GET("campaigns/{id}")
    suspend fun getCampaignById(
        @Path("id") id: String
    ): Response<CampaignDto>
}
