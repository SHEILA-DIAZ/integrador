package com.firesupportia.mobile.di

import com.firesupportia.mobile.data.local.session.SessionManager
import com.firesupportia.mobile.data.remote.api.CampaignApiService
import com.firesupportia.mobile.data.repository.AuthRepositoryImpl
import com.firesupportia.mobile.data.repository.CampaignRepositoryImpl
import com.firesupportia.mobile.domain.repository.AuthRepository
import com.firesupportia.mobile.domain.repository.CampaignRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object RepositoryModule {

    @Provides
    @Singleton
    fun provideAuthRepository(
        sessionManager: SessionManager,
        apiService: com.firesupportia.mobile.data.remote.api.AuthApiService
    ): AuthRepository {
        return AuthRepositoryImpl(sessionManager, apiService)
    }

    @Provides
    @Singleton
    fun provideCampaignRepository(
        apiService: CampaignApiService
    ): CampaignRepository {
        return CampaignRepositoryImpl(apiService)
    }
}
