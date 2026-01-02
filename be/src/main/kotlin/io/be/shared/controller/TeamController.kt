package io.be.shared.controller

import io.be.team.dto.TeamDto
import io.be.shared.exception.TeamNotFoundException
import io.be.team.application.TeamService
import io.be.shared.util.ApiResponse
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v1/teams")
@CrossOrigin(origins = ["*"])
class PublicTeamController(
    private val teamService: TeamService
) {

    @GetMapping
    fun getAllTeams(): ApiResponse<List<TeamDto>> {
        val teams = teamService.getAllTeams()
        return ApiResponse.success(teams)
    }

    @GetMapping("/code/{code}")
    fun getTeamByCode(@PathVariable code: String): ApiResponse<TeamDto> {
        val team = teamService.findTeamByCode(code)
            ?: throw TeamNotFoundException(code)

        return ApiResponse.success(team)
    }

    @GetMapping("/{id}")
    fun getTeamById(@PathVariable id: String): ApiResponse<TeamDto> {
        val teamId = id.toLongOrNull() ?: throw TeamNotFoundException(id)
        val team = teamService.findTeamById(id)
            ?: throw TeamNotFoundException(teamId)

        return ApiResponse.success(team)
    }
}
