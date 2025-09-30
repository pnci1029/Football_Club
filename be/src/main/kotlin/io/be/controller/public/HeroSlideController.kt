package io.be.controller.public

import io.be.dto.HeroSlideDto
import io.be.service.HeroSlideService
import io.be.service.SubdomainService
import io.be.util.ApiResponse
import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v1/hero-slides")
@CrossOrigin(origins = ["*"])
class HeroSlideController(
    private val heroSlideService: HeroSlideService,
    private val subdomainService: SubdomainService
) {
    
    @GetMapping("/active")
    fun getActiveSlides(request: HttpServletRequest): ResponseEntity<ApiResponse<List<HeroSlideDto>>> {
        val teamCode = subdomainService.extractTeamCodeFromRequest(request)
            ?: return ResponseEntity.badRequest()
                .body(ApiResponse.error("INVALID_SUBDOMAIN", "유효하지 않은 서브도메인입니다."))
            
        val team = subdomainService.getTeamByCode(teamCode)
            ?: return ResponseEntity.notFound().build()
            
        val slides = heroSlideService.getActiveSlidesForTeam(team.id)
        return ResponseEntity.ok(ApiResponse.success(slides, "Active hero slides retrieved successfully"))
    }
}