package io.be.admin.presentation

import io.be.admin.dto.AdminInfo
import io.be.admin.domain.AdminLevel
import io.be.team.dto.CreateTeamRequest
import io.be.team.dto.TeamDto
import io.be.team.dto.UpdateTeamRequest
import io.be.shared.exception.TeamNotFoundException
import io.be.shared.exception.UnauthorizedAdminAccessException
import io.be.shared.security.AdminPermissionRequired
import io.be.team.application.TeamService
import io.be.shared.util.ApiResponse
import io.be.shared.util.PagedResponse
import io.be.shared.util.PageMetadata
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
    
    @AdminPermissionRequired(level = AdminLevel.SUBDOMAIN)
    @GetMapping
    fun getAllTeams(
        @RequestAttribute("adminInfo") adminInfo: AdminInfo,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int,
        @RequestParam(required = false) search: String?
    ): ResponseEntity<ApiResponse<PagedResponse<TeamDto>>> {
        val teams = when (adminInfo.adminLevel) {
            AdminLevel.MASTER -> {
                // 마스터는 모든 팀 조회 가능
                teamService.findAllTeams(PageRequest.of(page, size))
            }
            AdminLevel.SUBDOMAIN -> {
                // 서브도메인 관리자는 자신의 팀만 조회 (단일 팀을 페이지 형태로 반환)
                val team = teamService.findByCode(adminInfo.teamSubdomain!!)
                    ?: throw UnauthorizedAdminAccessException("Invalid team subdomain")
                
                // 단일 팀을 Page로 변환
                Page.empty<TeamDto>(PageRequest.of(page, size)).let {
                    org.springframework.data.domain.PageImpl(listOf(team), PageRequest.of(page, size), 1)
                }
            }
        }
        
        val filters = mutableMapOf<String, Any>()
        search?.let { filters["search"] = it }
        
        val metadata = PageMetadata(
            filters = filters.takeIf { it.isNotEmpty() },
            additionalInfo = mapOf(
                "context" to "admin",
                "adminLevel" to adminInfo.adminLevel.name
            )
        )
        
        val pagedResponse = PagedResponse.of(teams, metadata)
        return ResponseEntity.ok(ApiResponse.success(pagedResponse, "Teams retrieved successfully"))
    }
    
    @AdminPermissionRequired(level = AdminLevel.MASTER) // 마스터만 팀 생성 가능
    @PostMapping
    fun createTeam(
        @RequestAttribute("adminInfo") adminInfo: AdminInfo,
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