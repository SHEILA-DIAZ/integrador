package com.firesupportia.mobile

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class FireSupportApp : Application() {
    override fun onCreate() {
        super.onCreate()
    }
}
