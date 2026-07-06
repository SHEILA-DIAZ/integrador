package com.firesupportia.mobile.data.remote.dto

import com.google.gson.annotations.SerializedName

data class CampaignDto(
    @SerializedName("id") val id: String,
    @SerializedName("titulo") val titulo: String,
    @SerializedName("descripcion") val descripcion: String,
    @SerializedName("monto_meta") val montoMeta: Double,
    @SerializedName("monto_recaudado") val montoRecaudado: Double,
    @SerializedName("es_urgente") val esUrgente: Boolean,
    @SerializedName("imagen_url") val imagenUrl: String?
)
