package com.firesupportia.mobile.data.local.session

import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey

object SessionPreferences {
    val AUTH_TOKEN = stringPreferencesKey("auth_token")
    val USER_ID = intPreferencesKey("user_id")
    val USER_NAME = stringPreferencesKey("user_name")
    val USER_EMAIL = stringPreferencesKey("user_email")
    val USER_ROLE = stringPreferencesKey("user_role")
    val IS_LOGGED_IN = booleanPreferencesKey("is_logged_in")
    val ONBOARDING_COMPLETED = booleanPreferencesKey("onboarding_completed")
}
