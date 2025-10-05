package io.be.match.dto

import io.be.stadium.dto.StadiumDto
import io.be.team.dto.TeamDto
import io.be.match.domain.Match
import io.be.match.domain.MatchStatus
import java.time.LocalDateTime

data class MatchDto(
    val id: Long,
    val homeTeam: TeamDto,
    val awayTeam: TeamDto,
    val stadium: StadiumDto,
    val matchDate: LocalDateTime,
    val homeTeamScore: Int?,
    val awayTeamScore: Int?,
    val status: MatchStatus,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
) {
    companion object {
        fun from(match: Match): MatchDto {
            return MatchDto(
                id = match.id,
                homeTeam = TeamDto.from(match.homeTeam),
                awayTeam = TeamDto.from(match.awayTeam),
                stadium = StadiumDto.from(match.stadium),
                matchDate = match.matchDate,
                homeTeamScore = match.homeTeamScore,
                awayTeamScore = match.awayTeamScore,
                status = match.status,
                createdAt = match.createdAt,
                updatedAt = match.updatedAt
            )
        }
    }
}

data class CreateMatchRequest(
    val homeTeamId: Long,
    val awayTeamId: Long,
    val stadiumId: Long,
    val matchDate: LocalDateTime
)

data class UpdateMatchRequest(
    val matchDate: LocalDateTime?,
    val homeTeamScore: Int?,
    val awayTeamScore: Int?,
    val status: MatchStatus?
)

data class MatchScoreRequest(
    val homeTeamScore: Int,
    val awayTeamScore: Int
)