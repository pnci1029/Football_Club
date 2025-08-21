package io.be.dto

import io.be.entity.Player

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
    val name: String,
    val position: String,
    val backNumber: Int?,
    val profileImageUrl: String?
)

data class UpdatePlayerRequest(
    val name: String?,
    val position: String?,
    val backNumber: Int?,
    val profileImageUrl: String?,
    val isActive: Boolean?
)