package com.firesupportia.mobile.domain.validation

/**
 * Contrato base para cualquier validador en la capa de dominio.
 * T representa el tipo de dato a validar (String, Int, etc.)
 */
interface Validator<T> {
    fun validate(value: T): ValidationResult
}
