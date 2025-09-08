package io.be.dto

import io.be.entity.Team
import jakarta.validation.constraints.*

data class TeamDto(
    val id: Long,
    val code: String,
    val name: String,
    val description: String?,
    val logoUrl: String?
) {
    companion object {
        fun from(team: Team): TeamDto {
            return TeamDto(
                id = team.id,
                code = team.code,
                name = team.name,
                description = team.description,
                logoUrl = team.logoUrl
            )
        }
    }
}

data class CreateTeamRequest(
    @field:NotBlank(message = "팀 코드는 필수입니다")
    @field:Size(min = 2, max = 20, message = "팀 코드는 2-20자여야 합니다")
    @field:Pattern(regexp = "^[a-z0-9-]+$", message = "팀 코드는 소문자, 숫자, 하이픈만 사용 가능합니다")
    val code: String,
    
    @field:NotBlank(message = "팀명은 필수입니다")
    @field:Size(min = 1, max = 100, message = "팀명은 1-100자여야 합니다")
    val name: String,
    
    @field:Size(max = 500, message = "설명은 500자 이하여야 합니다")
    val description: String? = null,
    
    @field:Pattern(regexp = "^(https?://.+)?$", message = "올바른 URL 형식이어야 합니다")
    val logoUrl: String? = null
)

data class UpdateTeamRequest(
    @field:Size(min = 1, max = 100, message = "팀명은 1-100자여야 합니다")
    val name: String? = null,
    
    @field:Size(max = 500, message = "설명은 500자 이하여야 합니다")
    val description: String? = null,
    
    @field:Pattern(regexp = "^(https?://.+)?$", message = "올바른 URL 형식이어야 합니다")
    val logoUrl: String? = null
)