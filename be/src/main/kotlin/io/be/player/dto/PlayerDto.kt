package io.be.player.dto

import io.be.player.domain.Player
import jakarta.validation.constraints.*

data class PlayerDto(
    val id: Long,
    val name: String,
    val position: String,
    val profileImageUrl: String?,
    val backNumber: Int?,
    val teamId: Long,
    val teamName: String,
    val isActive: Boolean
) {
    companion object {
        fun from(player: Player): PlayerDto {
            return PlayerDto(
                id = player.id,
                name = player.name,
                position = player.position,
                profileImageUrl = player.profileImageUrl,
                backNumber = player.backNumber,
                teamId = player.team.id,
                teamName = player.team.name,
                isActive = player.isActive
            )
        }
    }
}

data class CreatePlayerRequest(
    @field:NotBlank(message = "선수명은 필수입니다")
    @field:Size(min = 1, max = 50, message = "선수명은 1-50자여야 합니다")
    val name: String,
    
    @field:NotBlank(message = "포지션은 필수입니다")
    @field:Pattern(regexp = "^(GK|DF|MF|FW)$", message = "포지션은 GK, DF, MF, FW 중 하나여야 합니다")
    val position: String,
    
    @field:Min(value = 1, message = "등번호는 1 이상이어야 합니다")
    @field:Max(value = 99, message = "등번호는 99 이하여야 합니다")
    val backNumber: Int? = null,
    
    @field:Pattern(regexp = "^(https?://.+)?$", message = "올바른 URL 형식이어야 합니다")
    val profileImageUrl: String? = null
)

data class UpdatePlayerRequest(
    @field:Size(min = 1, max = 50, message = "선수명은 1-50자여야 합니다")
    val name: String? = null,
    
    @field:Pattern(regexp = "^(GK|DF|MF|FW)$", message = "포지션은 GK, DF, MF, FW 중 하나여야 합니다")
    val position: String? = null,
    
    @field:Min(value = 1, message = "등번호는 1 이상이어야 합니다")
    @field:Max(value = 99, message = "등번호는 99 이하여야 합니다")
    val backNumber: Int? = null,
    
    @field:Pattern(regexp = "^(https?://.+)?$", message = "올바른 URL 형식이어야 합니다")
    val profileImageUrl: String? = null,
    
    val isActive: Boolean? = null
)