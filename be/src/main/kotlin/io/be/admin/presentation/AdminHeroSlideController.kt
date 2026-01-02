package io.be.admin.presentation

import io.be.admin.dto.AdminInfo
import io.be.admin.domain.AdminLevel
import io.be.heroslide.dto.HeroSlideDto
import io.be.heroslide.dto.CreateHeroSlideRequest
import io.be.heroslide.dto.UpdateHeroSlideRequest
import io.be.heroslide.dto.UpdateSortOrderRequest
import io.be.heroslide.application.HeroSlideService
import io.be.shared.exception.UnauthorizedAdminAccessException
import io.be.shared.security.AdminPermissionRequired
import io.be.shared.exception.BadRequestException
import io.be.team.application.TeamService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v1/admin/hero-slides")
@CrossOrigin(origins = ["*"])
class AdminHeroSlideController(
    private val heroSlideService: HeroSlideService,
    private val teamService: TeamService
) {
    
    @GetMapping("/active")
    fun getActiveSlides(@RequestParam teamId: Long): ResponseEntity<List<HeroSlideDto>> {
        val slides = heroSlideService.getActiveSlidesForTeam(teamId)
        return ResponseEntity.ok(slides)
    }
    
    @GetMapping
    fun getAllSlides(@RequestParam teamId: Long): ResponseEntity<List<HeroSlideDto>> {
        val slides = heroSlideService.getAllSlidesForTeam(teamId)
        return ResponseEntity.ok(slides)
    }
    
    @AdminPermissionRequired(level = AdminLevel.SUBDOMAIN)
    @GetMapping("/{id}")
    fun getSlide(
        adminInfo: AdminInfo,
        @PathVariable id: Long
    ): ResponseEntity<HeroSlideDto> {
        val slide = heroSlideService.getSlideById(id)
            ?: return ResponseEntity.notFound().build()
        
        // 서브도메인 관리자는 자신의 팀 슬라이드만 조회 가능
        if (adminInfo.adminLevel == AdminLevel.SUBDOMAIN) {
            val team = teamService.findByCode(adminInfo.teamSubdomain!!)
                ?: throw UnauthorizedAdminAccessException("Invalid team subdomain")
            
            if (slide.teamId != team.id) {
                throw UnauthorizedAdminAccessException("Subdomain admin can only access slides from their own team")
            }
        }
        
        return ResponseEntity.ok(slide)
    }
    
    @AdminPermissionRequired(level = AdminLevel.SUBDOMAIN)
    @PostMapping
    fun createSlide(
        adminInfo: AdminInfo,
        @RequestParam teamId: Long,
        @Valid @RequestBody request: CreateHeroSlideRequest
    ): ResponseEntity<HeroSlideDto> {
        // 서브도메인 관리자는 자신의 팀에만 슬라이드 생성 가능
        if (adminInfo.adminLevel == AdminLevel.SUBDOMAIN) {
            val team = teamService.findByCode(adminInfo.teamSubdomain!!)
                ?: throw UnauthorizedAdminAccessException("Invalid team subdomain")
            
            if (teamId != team.id) {
                throw UnauthorizedAdminAccessException("Subdomain admin can only create slides for their own team")
            }
        }
        
        try {
            val slide = heroSlideService.createSlideForTeam(teamId, request)
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(slide)
        } catch (e: IllegalArgumentException) {
            throw BadRequestException(e.message ?: "Invalid request")
        }
    }
    
    @AdminPermissionRequired(level = AdminLevel.SUBDOMAIN)
    @PutMapping("/{id}")
    fun updateSlide(
        adminInfo: AdminInfo,
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdateHeroSlideRequest
    ): ResponseEntity<HeroSlideDto> {
        // 서브도메인 관리자는 자신의 팀 슬라이드만 수정 가능
        if (adminInfo.adminLevel == AdminLevel.SUBDOMAIN) {
            val existingSlide = heroSlideService.getSlideById(id)
                ?: throw UnauthorizedAdminAccessException("Slide not found")
            
            val team = teamService.findByCode(adminInfo.teamSubdomain!!)
                ?: throw UnauthorizedAdminAccessException("Invalid team subdomain")
            
            if (existingSlide.teamId != team.id) {
                throw UnauthorizedAdminAccessException("Subdomain admin can only update slides from their own team")
            }
        }
        
        try {
            val slide = heroSlideService.updateSlide(id, request)
            return ResponseEntity.ok(slide)
        } catch (e: IllegalArgumentException) {
            throw BadRequestException(e.message ?: "Invalid request")
        }
    }
    
    @AdminPermissionRequired(level = AdminLevel.SUBDOMAIN)
    @DeleteMapping("/{id}")
    fun deleteSlide(
        adminInfo: AdminInfo,
        @PathVariable id: Long
    ): ResponseEntity<String> {
        // 서브도메인 관리자는 자신의 팀 슬라이드만 삭제 가능
        if (adminInfo.adminLevel == AdminLevel.SUBDOMAIN) {
            val existingSlide = heroSlideService.getSlideById(id)
                ?: throw UnauthorizedAdminAccessException("Slide not found")
            
            val team = teamService.findByCode(adminInfo.teamSubdomain!!)
                ?: throw UnauthorizedAdminAccessException("Invalid team subdomain")
            
            if (existingSlide.teamId != team.id) {
                throw UnauthorizedAdminAccessException("Subdomain admin can only delete slides from their own team")
            }
        }
        
        try {
            heroSlideService.deleteSlide(id)
            return ResponseEntity.ok("deleted")
        } catch (e: IllegalArgumentException) {
            throw BadRequestException(e.message ?: "Invalid request")
        }
    }
    
    @AdminPermissionRequired(level = AdminLevel.SUBDOMAIN)
    @PutMapping("/sort-order")
    fun updateSortOrder(
        adminInfo: AdminInfo,
        @Valid @RequestBody request: UpdateSortOrderRequest
    ): ResponseEntity<String> {
        // 서브도메인 관리자는 자신의 팀 슬라이드 순서만 변경 가능
        if (adminInfo.adminLevel == AdminLevel.SUBDOMAIN) {
            val team = teamService.findByCode(adminInfo.teamSubdomain!!)
                ?: throw UnauthorizedAdminAccessException("Invalid team subdomain")
            
            // 요청된 슬라이드들이 모두 자신의 팀에 속하는지 확인
            request.slides.forEach { slideOrder ->
                val slide = heroSlideService.getSlideById(slideOrder.id)
                    ?: throw UnauthorizedAdminAccessException("Slide not found: ${slideOrder.id}")
                
                if (slide.teamId != team.id) {
                    throw UnauthorizedAdminAccessException("Subdomain admin can only manage slides from their own team")
                }
            }
        }
        
        try {
            heroSlideService.updateSortOrder(request)
            return ResponseEntity.ok("updated")
        } catch (e: IllegalArgumentException) {
            throw BadRequestException(e.message ?: "Invalid request")
        }
    }
}