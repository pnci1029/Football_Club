package io.be.shared.controller

import io.be.stadium.dto.StadiumDto
import io.be.stadium.application.StadiumService
import io.be.shared.service.SubdomainService
import io.be.shared.util.ApiResponse
import jakarta.servlet.http.HttpServletRequest
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v1/stadiums")
@CrossOrigin(origins = ["*"])
class StadiumController(
    private val stadiumService: StadiumService,
    private val subdomainService: SubdomainService
) {


    @GetMapping
    fun getAllStadiums(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int,
        httpRequest: HttpServletRequest
    ): ResponseEntity<ApiResponse<Page<StadiumDto>>> {
        // 서브도메인에서 팀 코드 추출
        val teamCode = subdomainService.extractTeamCodeFromRequest(httpRequest)

        val stadiums = if (teamCode != null) {
            // 특정 팀의 구장만 반환
            val team = subdomainService.getTeamByCode(teamCode)
            if (team != null) {
                stadiumService.findStadiumsByTeam(team.id, PageRequest.of(page, size))
            } else {
                stadiumService.findAllStadiums(PageRequest.of(page, size))
            }
        } else {
            // 모든 구장 반환 (메인 도메인 등)
            stadiumService.findAllStadiums(PageRequest.of(page, size))
        }

        return ResponseEntity.ok(ApiResponse.success(stadiums))
    }

    @GetMapping("/{id}")
    fun getStadium(@PathVariable id: Long): ResponseEntity<ApiResponse<StadiumDto>> {
        val stadium = stadiumService.findStadiumById(id)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(ApiResponse.success(stadium))
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
