package io.be.admin.presentation

import io.be.heroslide.dto.HeroSlideDto
import io.be.heroslide.dto.CreateHeroSlideRequest
import io.be.heroslide.dto.UpdateHeroSlideRequest
import io.be.heroslide.dto.UpdateSortOrderRequest
import io.be.heroslide.application.HeroSlideService
import io.be.shared.util.ApiResponse
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v1/admin/hero-slides")
@CrossOrigin(origins = ["*"])
class AdminHeroSlideController(
    private val heroSlideService: HeroSlideService
) {
    
    @GetMapping("/active")
    fun getActiveSlides(@RequestParam teamId: Long): ResponseEntity<ApiResponse<List<HeroSlideDto>>> {
        val slides = heroSlideService.getActiveSlidesForTeam(teamId)
        return ResponseEntity.ok(ApiResponse.success(slides, "Active hero slides retrieved successfully"))
    }
    
    @GetMapping
    fun getAllSlides(@RequestParam teamId: Long): ResponseEntity<ApiResponse<List<HeroSlideDto>>> {
        val slides = heroSlideService.getAllSlidesForTeam(teamId)
        return ResponseEntity.ok(ApiResponse.success(slides, "Hero slides retrieved successfully"))
    }
    
    @GetMapping("/{id}")
    fun getSlide(@PathVariable id: Long): ResponseEntity<ApiResponse<HeroSlideDto>> {
        val slide = heroSlideService.getSlideById(id)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(ApiResponse.success(slide))
    }
    
    @PostMapping
    fun createSlide(
        @RequestParam teamId: Long,
        @Valid @RequestBody request: CreateHeroSlideRequest
    ): ResponseEntity<ApiResponse<HeroSlideDto>> {
        try {
            val slide = heroSlideService.createSlideForTeam(teamId, request)
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(slide, "Hero slide created successfully"))
        } catch (e: IllegalArgumentException) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.message ?: "Invalid request"))
        }
    }
    
    @PutMapping("/{id}")
    fun updateSlide(
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdateHeroSlideRequest
    ): ResponseEntity<ApiResponse<HeroSlideDto>> {
        try {
            val slide = heroSlideService.updateSlide(id, request)
            return ResponseEntity.ok(ApiResponse.success(slide, "Hero slide updated successfully"))
        } catch (e: IllegalArgumentException) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.message ?: "Invalid request"))
        }
    }
    
    @DeleteMapping("/{id}")
    fun deleteSlide(@PathVariable id: Long): ResponseEntity<ApiResponse<String>> {
        try {
            heroSlideService.deleteSlide(id)
            return ResponseEntity.ok(ApiResponse.success("deleted", "Hero slide deleted successfully"))
        } catch (e: IllegalArgumentException) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.message ?: "Invalid request"))
        }
    }
    
    @PutMapping("/sort-order")
    fun updateSortOrder(
        @Valid @RequestBody request: UpdateSortOrderRequest
    ): ResponseEntity<ApiResponse<String>> {
        try {
            heroSlideService.updateSortOrder(request)
            return ResponseEntity.ok(ApiResponse.success("updated", "Sort order updated successfully"))
        } catch (e: IllegalArgumentException) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.message ?: "Invalid request"))
        }
    }
}