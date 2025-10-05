package io.be.shared.dto

import io.be.team.domain.Team
import io.be.player.domain.Player

data class TeamSummaryDto(
    val id: Long,
    val code: String,
    val name: String
) {
    companion object {
        fun from(team: Team): TeamSummaryDto {
            return TeamSummaryDto(
                id = team.id,
                code = team.code,
                name = team.name
            )
        }
    }
}

data class PlayerSummaryDto(
    val id: Long,
    val name: String,
    val position: String,
    val backNumber: Int?
) {
    companion object {
        fun from(player: Player): PlayerSummaryDto {
            return PlayerSummaryDto(
                id = player.id,
                name = player.name,
                position = player.position,
                backNumber = player.backNumber
            )
        }
    }
}

data class TeamWithPlayerCountDto(
    val id: Long,
    val code: String,
    val name: String,
    val playerCount: Long
) {
    companion object {
        fun from(team: Team, playerCount: Long): TeamWithPlayerCountDto {
            return TeamWithPlayerCountDto(
                id = team.id,
                code = team.code,
                name = team.name,
                playerCount = playerCount
            )
        }
    }
}