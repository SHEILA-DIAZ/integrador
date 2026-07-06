package com.firesupportia.mobile.data.remote.network

object NetworkConstants {
    const val BASE_URL = "http://127.0.0.1:3000/api/" // Físico con adb reverse (más estable que localhost)
    // const val BASE_URL = "http://10.0.2.2:3000/api/" // Emulador
    const val API_VERSION = "v1"
    const val REQUEST_TIMEOUT = 30L
}
