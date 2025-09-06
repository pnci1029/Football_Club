package io.be.controller

import io.be.dto.HeroSlideDto
import io.be.service.HeroSlideService
import io.be.util.ApiResponse
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v1/hero-slides")
@CrossOrigin(origins = ["*"])
class HeroSlideController(
    private val heroSlideService: HeroSlideService
) {
    
    @GetMapping("/active")
    fun getActiveSlides(): ResponseEntity<ApiResponse<List<HeroSlideDto>>> {
        val slides = heroSlideService.getActiveSlides()
        return ResponseEntity.ok(ApiResponse.success(slides, "Active hero slides retrieved successfully"))
    }
}