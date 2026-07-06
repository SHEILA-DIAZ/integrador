package com.firesupportia.mobile.domain.validation

import android.util.Patterns

class EmailValidator : Validator<String> {

    private val emailRegex =
        Regex("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")

    override fun validate(value: String): ValidationResult {

        if (value.isBlank())
            return ValidationResult.Error(AuthError.FieldEmpty)

        if (!emailRegex.matches(value))
            return ValidationResult.Error(AuthError.InvalidEmail)

        return ValidationResult.Success
    }
}

class PasswordValidator : Validator<String> {
    override fun validate(value: String): ValidationResult {
        if (value.isBlank()) return ValidationResult.Error(AuthError.FieldEmpty)
        if (value.length < 6) return ValidationResult.Error(AuthError.PasswordTooShort)
        return ValidationResult.Success
    }
}

class NameValidator : Validator<String> {
    override fun validate(value: String): ValidationResult {
        if (value.isBlank()) return ValidationResult.Error(AuthError.FieldEmpty)
        if (value.trim().length < 3) return ValidationResult.Error(AuthError.InputTooShort)
        return ValidationResult.Success
    }
}

// Extensión de errores necesarios para el dominio
sealed class AuthError : ValidationError {
    object FieldEmpty : AuthError()
    object InvalidEmail : AuthError()
    object PasswordTooShort : AuthError()
    object PasswordsDoNotMatch : AuthError()
    object UnacceptedTerms : AuthError()
    object InputTooShort : AuthError()
}
