package io.be.controller.admin

import io.be.dto.CreateStadiumRequest
import io.be.dto.StadiumDto
import io.be.dto.UpdateStadiumRequest
import io.be.service.StadiumService
import io.be.service.SubdomainService
import io.be.util.ApiResponse
import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.Valid
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v1/admin/stadiums")
@CrossOrigin(origins = ["*"])
class AdminStadiumController(
    private val stadiumService: StadiumService,
    private val subdomainService: SubdomainService
) {
    
    @GetMapping
    fun getAllStadiums(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int,
        @RequestParam(required = false) teamId: Long?
    ): ResponseEntity<ApiResponse<Page<StadiumDto>>> {
        val stadiums = if (teamId != null) {
            stadiumService.findStadiumsByTeam(teamId, PageRequest.of(page, size))
        } else {
            stadiumService.findAllStadiums(PageRequest.of(page, size))
        }
        return ResponseEntity.ok(ApiResponse.success(stadiums))
    }
    
    @PostMapping
    fun createStadium(
        @Valid @RequestBody request: CreateStadiumRequest,
        httpRequest: HttpServletRequest
    ): ResponseEntity<ApiResponse<StadiumDto>> {
        val teamCode = subdomainService.extractTeamCodeFromRequest(httpRequest)
            ?: return ResponseEntity.badRequest()
                .body(ApiResponse.error("INVALID_SUBDOMAIN", "유효하지 않은 서브도메인입니다."))
        
        val team = subdomainService.getTeamByCode(teamCode)
            ?: return ResponseEntity.badRequest()
                .body(ApiResponse.error("TEAM_NOT_FOUND", "팀을 찾을 수 없습니다."))
        
        val requestWithTeam = request.copy(teamId = team.id)
        val stadium = stadiumService.createStadium(requestWithTeam)
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(stadium))
    }
    
    @GetMapping("/{id}")
    fun getStadium(@PathVariable id: Long): ResponseEntity<ApiResponse<StadiumDto>> {
        val stadium = stadiumService.findStadiumById(id)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(ApiResponse.success(stadium))
    }
    
    @PutMapping("/{id}")
    fun updateStadium(
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdateStadiumRequest
    ): ResponseEntity<ApiResponse<StadiumDto>> {
        val updatedStadium = stadiumService.updateStadium(id, request)
        return ResponseEntity.ok(ApiResponse.success(updatedStadium))
    }
    
    @DeleteMapping("/{id}")
    fun deleteStadium(@PathVariable id: Long): ResponseEntity<ApiResponse<String>> {
        stadiumService.deleteStadium(id)
        return ResponseEntity.ok(ApiResponse.success("Stadium deleted successfully"))
    }
    
    @GetMapping("/search")
    fun searchStadiums(
        @RequestParam(required = false) name: String?,
        @RequestParam(required = false) address: String?
    ): ResponseEntity<ApiResponse<List<StadiumDto>>> {
        val stadiums = when {
            !name.isNullOrBlank() -> stadiumService.searchStadiumsByName(name)
            !address.isNullOrBlank() -> stadiumService.searchStadiumsByAddress(address)
            else -> emptyList()
        }
        
        return ResponseEntity.ok(ApiResponse.success(stadiums))
    }
}