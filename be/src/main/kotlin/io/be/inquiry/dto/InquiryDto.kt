package io.be.inquiry.dto

import io.be.inquiry.domain.Inquiry
import io.be.inquiry.domain.InquiryStatus
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import java.time.LocalDateTime

data class CreateInquiryRequest(
    @field:NotBlank(message = "이름은 필수입니다")
    val name: String,
    
    @field:NotBlank(message = "이메일은 필수입니다")
    @field:Email(message = "올바른 이메일 형식이 아닙니다")
    val email: String,
    
    @field:NotBlank(message = "연락처는 필수입니다")
    @field:Pattern(regexp = "^[0-9-]+$", message = "연락처는 숫자와 하이픈만 입력 가능합니다")
    val phone: String,
    
    @field:NotBlank(message = "팀명은 필수입니다")
    val teamName: String,
    
    val message: String? = null
)

data class InquiryDto(
    val id: Long,
    val name: String,
    val email: String,
    val phone: String,
    val teamName: String,
    val message: String?,
    val status: InquiryStatus,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
    val processedAt: LocalDateTime?,
    val adminNote: String?
) {
    companion object {
        fun from(inquiry: Inquiry): InquiryDto {
            return InquiryDto(
                id = inquiry.id,
                name = inquiry.name,
                email = inquiry.email,
                phone = inquiry.phone,
                teamName = inquiry.teamName,
                message = inquiry.message,
                status = inquiry.status,
                createdAt = inquiry.createdAt,
                updatedAt = inquiry.updatedAt,
                processedAt = inquiry.processedAt,
                adminNote = inquiry.adminNote
            )
        }
    }
}

data class UpdateInquiryStatusRequest(
    val status: InquiryStatus,
    val adminNote: String? = null
)

data class InquirySearchRequest(
    val name: String? = null,
    val email: String? = null,
    val teamName: String? = null,
    val status: InquiryStatus? = null,
    val page: Int = 0,
    val size: Int = 20
)