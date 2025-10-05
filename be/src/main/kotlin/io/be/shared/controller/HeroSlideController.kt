package io.be.shared.controller

import io.be.heroslide.dto.HeroSlideDto
import io.be.heroslide.application.HeroSlideService
import io.be.shared.service.SubdomainService
import io.be.shared.util.ApiResponse
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