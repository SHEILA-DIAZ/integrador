package com.firesupportia.mobile.data.mapper

import com.firesupportia.mobile.data.remote.dto.UserDto
import com.firesupportia.mobile.domain.model.User

fun UserDto.toDomain(): User {
    return User(
        id = this.id,
        nombre = this.nombre,
        email = this.email,
        rol = this.rol
    )
}
