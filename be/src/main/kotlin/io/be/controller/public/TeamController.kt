package io.be.controller.public

import io.be.dto.TeamDto
import io.be.util.ApiResponse
import io.be.service.TeamService
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
        return ResponseEntity.ok(ApiResponse.success(teams))
    }

    @GetMapping("/code/{code}")
    fun getTeamByCode(@PathVariable code: String): ResponseEntity<ApiResponse<TeamDto>> {
        val team = teamService.findTeamByCode(code)
            ?: return ResponseEntity.ok(ApiResponse.error("TEAM_NOT_FOUND", "팀을 찾을 수 없습니다"))

        return ResponseEntity.ok(ApiResponse.success(team))
    }

    @GetMapping("/{id}")
    fun getTeamById(@PathVariable id: String): ResponseEntity<ApiResponse<TeamDto>> {
        val team = teamService.findTeamById(id)
            ?: return ResponseEntity.ok(ApiResponse.error("TEAM_NOT_FOUND", "팀을 찾을 수 없습니다"))

        return ResponseEntity.ok(ApiResponse.success(team))
    }
}
