package com.firesupportia.mobile.data.remote.network

import com.firesupportia.mobile.data.local.session.SessionManager
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import javax.inject.Inject

/**
 * Encargado de proveer el token de sesión para las peticiones de red.
 */
class TokenProvider @Inject constructor(private val sessionManager: SessionManager) {
    
    fun getToken(): String? = runBlocking {
        sessionManager.getAuthToken().first()
    }
}
