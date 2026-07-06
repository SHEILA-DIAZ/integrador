package com.firesupportia.mobile.ui.core.utils

import com.firesupportia.mobile.data.remote.network.ApiResult

/**
 * Mapea resultados de API a mensajes amigables basados en códigos HTTP.
 */
fun <T> ApiResult<T>.toUiMessage(): String? {
    return when (this) {
        is ApiResult.Error -> {
            when (this.code) {
                400 -> "Datos incorrectos. Revisa los campos."
                401 -> "Credenciales inválidas. Inténtalo de nuevo."
                403 -> "Acceso denegado o cuenta bloqueada."
                404 -> "Servicio no disponible."
                500 -> "Error en el servidor. Reintenta más tarde."
                else -> this.message
            }
        }
        is ApiResult.NetworkError -> "Sin conexión a Internet. Verifica tu red."
        is ApiResult.UnknownError -> "Ocurrió un error inesperado."
        else -> null
    }
}
