package io.be.controller.admin

import io.be.dto.CreateTeamRequest
import io.be.dto.TeamDto
import io.be.dto.UpdateTeamRequest
import io.be.exception.TeamNotFoundException
import io.be.service.TeamService
import io.be.util.ApiResponse
import io.be.util.PagedResponse
import io.be.util.PageMetadata
import jakarta.validation.Valid
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
        @RequestParam(defaultValue = "10") size: Int,
        @RequestParam(required = false) search: String?
    ): ResponseEntity<ApiResponse<PagedResponse<TeamDto>>> {
        val teams = teamService.findAllTeams(PageRequest.of(page, size))
        
        val filters = mutableMapOf<String, Any>()
        search?.let { filters["search"] = it }
        
        val metadata = PageMetadata(
            filters = filters.takeIf { it.isNotEmpty() },
            additionalInfo = mapOf("context" to "admin")
        )
        
        val pagedResponse = PagedResponse.of(teams, metadata)
        return ResponseEntity.ok(ApiResponse.success(pagedResponse, "Teams retrieved successfully"))
    }
    
    @PostMapping
    fun createTeam(
        @Valid @RequestBody request: CreateTeamRequest
    ): ResponseEntity<ApiResponse<TeamDto>> {
        val team = teamService.createTeam(request)
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(team, "Team created successfully"))
    }
    
    @GetMapping("/{id}")
    fun getTeam(@PathVariable id: Long): ResponseEntity<ApiResponse<TeamDto>> {
        val team = teamService.findTeamById(id)
            ?: throw TeamNotFoundException(id)
        return ResponseEntity.ok(ApiResponse.success(team))
    }
    
    @PutMapping("/{id}")
    fun updateTeam(
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdateTeamRequest
    ): ResponseEntity<ApiResponse<TeamDto>> {
        val updatedTeam = teamService.updateTeam(id, request)
        return ResponseEntity.ok(ApiResponse.success(updatedTeam, "Team updated successfully"))
    }
    
    @DeleteMapping("/{id}")
    fun deleteTeam(@PathVariable id: Long): ResponseEntity<ApiResponse<String>> {
        teamService.deleteTeam(id)
        return ResponseEntity.ok(ApiResponse.success("deleted", "Team deleted successfully"))
    }
    
    @GetMapping("/code/{code}")
    fun getTeamByCode(@PathVariable code: String): ResponseEntity<ApiResponse<TeamDto>> {
        val team = teamService.findTeamByCode(code)
            ?: throw TeamNotFoundException(code)
        return ResponseEntity.ok(ApiResponse.success(team))
    }
    
    @GetMapping("/{teamId}/stats")
    fun getTeamStats(@PathVariable teamId: Long): ResponseEntity<ApiResponse<Map<String, Any>>> {
        val stats = teamService.getTeamStats(teamId)
        return ResponseEntity.ok(ApiResponse.success(stats, "Team stats retrieved successfully"))
    }
    
    @GetMapping("/dashboard-stats")
    fun getDashboardStats(): ResponseEntity<ApiResponse<Map<String, Any>>> {
        val stats = teamService.getAllTeamsStats()
        return ResponseEntity.ok(ApiResponse.success(stats, "Dashboard stats retrieved successfully"))
    }
}