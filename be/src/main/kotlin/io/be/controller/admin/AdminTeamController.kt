package io.be.controller.admin

import io.be.dto.CreateTeamRequest
import io.be.dto.TeamDto
import io.be.dto.UpdateTeamRequest
import io.be.service.TeamService
import io.be.util.ApiResponse
import jakarta.validation.Valid
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v1/admin/teams")
@CrossOrigin(origins = ["*"])
class AdminTeamController(
    private val teamService: TeamService
) {
    
    @GetMapping
    fun getAllTeams(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int
    ): ResponseEntity<ApiResponse<Page<TeamDto>>> {
        val teams = teamService.findAllTeams(PageRequest.of(page, size))
        return ResponseEntity.ok(ApiResponse.success(teams))
    }
    
    @PostMapping
    fun createTeam(
        @Valid @RequestBody request: CreateTeamRequest
    ): ResponseEntity<ApiResponse<TeamDto>> {
        val team = teamService.createTeam(request)
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(team))
    }
    
    @GetMapping("/{id}")
    fun getTeam(@PathVariable id: Long): ResponseEntity<ApiResponse<TeamDto>> {
        val team = teamService.findTeamById(id)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(ApiResponse.success(team))
    }
    
    @PutMapping("/{id}")
    fun updateTeam(
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdateTeamRequest
    ): ResponseEntity<ApiResponse<TeamDto>> {
        val updatedTeam = teamService.updateTeam(id, request)
        return ResponseEntity.ok(ApiResponse.success(updatedTeam))
    }
    
    @DeleteMapping("/{id}")
    fun deleteTeam(@PathVariable id: Long): ResponseEntity<ApiResponse<String>> {
        teamService.deleteTeam(id)
        return ResponseEntity.ok(ApiResponse.success("Team deleted successfully"))
    }
    
    @GetMapping("/code/{code}")
    fun getTeamByCode(@PathVariable code: String): ResponseEntity<ApiResponse<TeamDto>> {
        val team = teamService.findTeamByCode(code)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(ApiResponse.success(team))
    }
    
    @GetMapping("/{teamId}/stats")
    fun getTeamStats(@PathVariable teamId: Long): ResponseEntity<ApiResponse<Map<String, Any>>> {
        val stats = teamService.getTeamStats(teamId)
        return ResponseEntity.ok(ApiResponse.success(stats))
    }
    
    @GetMapping("/dashboard-stats")
    fun getDashboardStats(): ResponseEntity<ApiResponse<Map<String, Any>>> {
        val stats = teamService.getAllTeamsStats()
        return ResponseEntity.ok(ApiResponse.success(stats))
    }
}