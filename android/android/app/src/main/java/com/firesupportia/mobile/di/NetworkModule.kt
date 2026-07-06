package com.firesupportia.mobile.di

import com.firesupportia.mobile.data.local.session.SessionManager
import com.firesupportia.mobile.data.remote.api.AuthApiService
import com.firesupportia.mobile.data.remote.api.CampaignApiService
import com.firesupportia.mobile.data.remote.network.AuthInterceptor
import com.firesupportia.mobile.data.remote.network.NetworkConstants
import com.firesupportia.mobile.data.remote.network.TokenProvider
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    @Provides
    @Singleton
    fun provideTokenProvider(sessionManager: SessionManager): TokenProvider {
        return TokenProvider(sessionManager)
    }

    @Provides
    @Singleton
    fun provideAuthInterceptor(tokenProvider: TokenProvider): AuthInterceptor {
        return AuthInterceptor(tokenProvider)
    }

    @Provides
    @Singleton
    fun provideLoggingInterceptor(): HttpLoggingInterceptor {
        return HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }
    }

    @Provides
    @Singleton
    fun provideOkHttpClient(
        authInterceptor: AuthInterceptor,
        loggingInterceptor: HttpLoggingInterceptor
    ): OkHttpClient {
        return OkHttpClient.Builder()
            .addInterceptor(authInterceptor)
            .addInterceptor(loggingInterceptor)
            .connectTimeout(NetworkConstants.REQUEST_TIMEOUT, TimeUnit.SECONDS)
            .readTimeout(NetworkConstants.REQUEST_TIMEOUT, TimeUnit.SECONDS)
            .writeTimeout(NetworkConstants.REQUEST_TIMEOUT, TimeUnit.SECONDS)
            .build()
    }

    @Provides
    @Singleton
    fun provideRetrofit(okHttpClient: OkHttpClient): Retrofit {
        return Retrofit.Builder()
            .baseUrl(NetworkConstants.BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    @Provides
    @Singleton
    fun provideAuthApiService(retrofit: Retrofit): AuthApiService {
        return retrofit.create(AuthApiService::class.java)
    }

    @Provides
    @Singleton
    fun provideCampaignApiService(retrofit: Retrofit): CampaignApiService {
        return retrofit.create(CampaignApiService::class.java)
    }
}
