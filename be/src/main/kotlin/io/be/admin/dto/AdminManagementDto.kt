package io.be.admin.dto

import io.be.admin.domain.Admin
import java.time.LocalDateTime

data class AdminBasicInfo(
    val id: Long,
    val username: String,
    val name: String,
    val email: String?,
    val role: String,
    val createdAt: LocalDateTime,
    val lastLoginAt: LocalDateTime?
) {
    companion object {
        fun from(admin: Admin): AdminBasicInfo {
            return AdminBasicInfo(
                id = admin.id,
                username = admin.username,
                name = admin.name ?: "",
                email = admin.email,
                role = admin.role,
                createdAt = admin.createdAt,
                lastLoginAt = admin.lastLoginAt
            )
        }
    }
}

data class CreateAdminRequest(
    val teamId: Long,
    val username: String,
    val name: String,
    val email: String?,
    val password: String,
)

