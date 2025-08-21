package io.be.dto

import io.be.entity.Team

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
    val code: String,
    val name: String,
    val description: String?,
    val logoUrl: String?
)

data class UpdateTeamRequest(
    val name: String?,
    val description: String?,
    val logoUrl: String?
)