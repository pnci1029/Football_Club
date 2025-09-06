package io.be.controller.admin

import io.be.dto.*
import io.be.service.HeroSlideService
import io.be.util.ApiResponse
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
    fun getActiveSlides(): ResponseEntity<ApiResponse<List<HeroSlideDto>>> {
        val slides = heroSlideService.getActiveSlides()
        return ResponseEntity.ok(ApiResponse.success(slides, "Active hero slides retrieved successfully"))
    }
    
    @GetMapping
    fun getAllSlides(): ResponseEntity<ApiResponse<List<HeroSlideDto>>> {
        val slides = heroSlideService.getAllSlides()
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
        @Valid @RequestBody request: CreateHeroSlideRequest
    ): ResponseEntity<ApiResponse<HeroSlideDto>> {
        try {
            val slide = heroSlideService.createSlide(request)
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