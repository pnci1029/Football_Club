package io.be.shared.controller

import io.be.team.dto.TeamDto
import io.be.shared.exception.TeamNotFoundException
import io.be.shared.util.ApiResponse
import io.be.team.application.TeamService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v1/teams")
@CrossOrigin(origins = ["*"])
class PublicTeamController(
    private val teamService: TeamService
) {

    @GetMapping
    fun getAllTeams(): ResponseEntity<ApiResponse<List<TeamDto>>> {
        val teams = teamService.getAllTeams()
        return ResponseEntity.ok(ApiResponse.success(teams, "All teams retrieved successfully"))
    }

    @GetMapping("/code/{code}")
    fun getTeamByCode(@PathVariable code: String): ResponseEntity<ApiResponse<TeamDto>> {
        val team = teamService.findTeamByCode(code)
            ?: throw TeamNotFoundException(code)

        return ResponseEntity.ok(ApiResponse.success(team))
    }

    @GetMapping("/{id}")
    fun getTeamById(@PathVariable id: String): ResponseEntity<ApiResponse<TeamDto>> {
        val teamId = id.toLongOrNull() ?: throw TeamNotFoundException(id)
        val team = teamService.findTeamById(id)
            ?: throw TeamNotFoundException(teamId)

        return ResponseEntity.ok(ApiResponse.success(team))
    }
}
