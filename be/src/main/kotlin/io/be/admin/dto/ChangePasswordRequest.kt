package io.be.admin.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class ChangePasswordRequest(
    @field:NotBlank(message = "새 비밀번호는 필수입니다")
    @field:Size(min = 6, max = 100, message = "비밀번호는 6자 이상 100자 이하여야 합니다")
    val newPassword: String
)