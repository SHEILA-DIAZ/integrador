package com.firesupportia.mobile.domain.validation

sealed interface ValidationResult {
    object Success : ValidationResult
    data class Error(val error: ValidationError) : ValidationResult
}
