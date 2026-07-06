package com.firesupportia.mobile.data.local.session

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.emptyPreferences
import androidx.datastore.preferences.preferencesDataStore
import com.firesupportia.mobile.domain.model.AuthSession
import com.firesupportia.mobile.domain.model.User
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.map
import java.io.IOException

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "user_session")

class SessionManager(private val context: Context) {

    suspend fun saveSession(session: AuthSession) {
        context.dataStore.edit { preferences ->
            preferences[SessionPreferences.AUTH_TOKEN] = session.token
            preferences[SessionPreferences.USER_ID] = session.user.id
            preferences[SessionPreferences.USER_NAME] = session.user.nombre
            preferences[SessionPreferences.USER_EMAIL] = session.user.email
            preferences[SessionPreferences.USER_ROLE] = session.user.rol
            preferences[SessionPreferences.IS_LOGGED_IN] = true
        }
    }

    fun getAuthToken(): Flow<String?> {
        return context.dataStore.data
            .catch { exception ->
                if (exception is IOException) emit(emptyPreferences()) else throw exception
            }
            .map { preferences ->
                preferences[SessionPreferences.AUTH_TOKEN]
            }
    }

    fun isUserLoggedIn(): Flow<Boolean> {
        return context.dataStore.data
            .map { preferences ->
                preferences[SessionPreferences.IS_LOGGED_IN] ?: false
            }
    }

    suspend fun clearSession() {
        context.dataStore.edit { preferences ->
            preferences.clear()
        }
    }

    fun getUser(): Flow<User?> {
        return context.dataStore.data.map { preferences ->
            val id = preferences[SessionPreferences.USER_ID]
            val nombre = preferences[SessionPreferences.USER_NAME]
            val email = preferences[SessionPreferences.USER_EMAIL]
            val rol = preferences[SessionPreferences.USER_ROLE]

            if (id != null && nombre != null && email != null && rol != null) {
                User(id, nombre, email, rol)
            } else null
        }
    }

    suspend fun setOnboardingCompleted() {
        context.dataStore.edit {
            it[SessionPreferences.ONBOARDING_COMPLETED] = true
        }
    }

    val onboardingCompleted: Flow<Boolean> =
        context.dataStore.data.map {
            it[SessionPreferences.ONBOARDING_COMPLETED] ?: false
        }
}
