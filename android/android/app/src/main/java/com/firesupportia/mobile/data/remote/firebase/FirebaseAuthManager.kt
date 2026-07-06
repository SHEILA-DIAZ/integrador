package com.firesupportia.mobile.data.remote.firebase

import android.content.Context
import com.google.firebase.auth.AuthCredential
import com.google.firebase.auth.FirebaseAuth
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.tasks.await
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class FirebaseAuthManager @Inject constructor(
    @ApplicationContext context: Context
) {

    private val auth = FirebaseAuth.getInstance()

    suspend fun signInWithCredential(
        credential: AuthCredential
    ): Result<String> {

        return try {

            val result = auth.signInWithCredential(credential).await()

            val firebaseUser = result.user
                ?: return Result.failure(Exception("Usuario no encontrado"))

            val token = firebaseUser.getIdToken(true).await().token
                ?: return Result.failure(Exception("No se pudo obtener el token"))

            Result.success(token)

        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun logout() {
        auth.signOut()
    }

    fun currentUser() = auth.currentUser
}
