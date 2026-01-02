package io.be.shared.controller

import io.be.heroslide.dto.HeroSlideDto
import io.be.heroslide.application.HeroSlideService
import io.be.shared.service.SubdomainService
import io.be.shared.exception.BadRequestException
import jakarta.servlet.http.HttpServletRequest
import io.be.shared.util.ApiResponse
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v1/hero-slides")
@CrossOrigin(origins = ["*"])
class HeroSlideController(
    private val heroSlideService: HeroSlideService,
    private val subdomainService: SubdomainService
) {
    
    @GetMapping("/active")
    fun getActiveSlides(request: HttpServletRequest): ApiResponse<List<HeroSlideDto>> {
        val teamCode = subdomainService.extractTeamCodeFromRequest(request)
            ?: throw BadRequestException("유효하지 않은 서브도메인입니다.")
            
        val team = subdomainService.getTeamByCode(teamCode)
            ?: return ApiResponse.error("NOT_FOUND", "찾을 수 없습니다.")
            
        val slides = heroSlideService.getActiveSlidesForTeam(team.id)
        return ApiResponse.success(slides)
    }
}