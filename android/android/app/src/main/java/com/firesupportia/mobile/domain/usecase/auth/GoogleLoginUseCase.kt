package com.firesupportia.mobile.domain.usecase.auth

import com.firesupportia.mobile.data.remote.firebase.FirebaseAuthManager
import com.google.firebase.auth.AuthCredential
import javax.inject.Inject

class GoogleLoginUseCase @Inject constructor(
    private val firebaseManager: FirebaseAuthManager
) {

    suspend operator fun invoke(
        credential: AuthCredential
    ) = firebaseManager.signInWithCredential(credential)

}
