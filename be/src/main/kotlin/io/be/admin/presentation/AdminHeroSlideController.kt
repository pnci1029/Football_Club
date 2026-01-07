package io.be.admin.presentation

import io.be.admin.dto.AdminInfo
import io.be.admin.domain.AdminLevel
import io.be.heroslide.dto.HeroSlideDto
import io.be.heroslide.dto.CreateHeroSlideRequest
import io.be.heroslide.dto.UpdateHeroSlideRequest
import io.be.heroslide.dto.UpdateSortOrderRequest
import io.be.heroslide.application.HeroSlideService
import io.be.heroslide.domain.GradientColor
import io.be.shared.exception.UnauthorizedAdminAccessException
import io.be.shared.security.AdminPermissionRequired
import io.be.shared.exception.BadRequestException
import io.be.team.application.TeamService
import io.be.shared.service.ImageUploadService
import io.be.shared.service.ImageUploadType
import io.be.shared.service.UploadContext
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import io.be.shared.util.ApiResponse
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/v1/admin/hero-slides")
@CrossOrigin(origins = ["*"])
class AdminHeroSlideController(
    private val heroSlideService: HeroSlideService,
    private val teamService: TeamService,
    private val imageUploadService: ImageUploadService
) {
    
    @AdminPermissionRequired(level = AdminLevel.SUBDOMAIN)
    @GetMapping("/active")
    fun getActiveSlides(@RequestParam teamId: Long): ApiResponse<List<HeroSlideDto>> {
        val slides = heroSlideService.getActiveSlidesForTeam(teamId)
        return ApiResponse.success(slides)
    }
    
    @AdminPermissionRequired(level = AdminLevel.SUBDOMAIN)
    @GetMapping
    fun getAllSlides(@RequestParam teamId: Long): ApiResponse<List<HeroSlideDto>> {
        val slides = heroSlideService.getAllSlidesForTeam(teamId)
        return ApiResponse.success(slides)
    }
    
    @AdminPermissionRequired(level = AdminLevel.SUBDOMAIN)
    @GetMapping("/{id}")
    fun getSlide(
        @RequestAttribute adminInfo: AdminInfo,
        @PathVariable id: Long
    ): ApiResponse<HeroSlideDto> {
        val slide = heroSlideService.getSlideById(id)
            ?: return ApiResponse.error("NOT_FOUND", "찾을 수 없습니다.")
        
        // 서브도메인 관리자는 자신의 팀 슬라이드만 조회 가능
        if (adminInfo.adminLevel == AdminLevel.SUBDOMAIN) {
            val team = teamService.findByCode(adminInfo.teamSubdomain!!)
                ?: throw UnauthorizedAdminAccessException("Invalid team subdomain")
            
            if (slide.teamId != team.id) {
                throw UnauthorizedAdminAccessException("Subdomain admin can only access slides from their own team")
            }
        }
        
        return ApiResponse.success(slide)
    }
    
    @AdminPermissionRequired(level = AdminLevel.SUBDOMAIN)
    @PostMapping
    fun createSlide(
        @RequestAttribute adminInfo: AdminInfo,
        @RequestParam teamId: Long,
        @RequestParam("file", required = false) file: MultipartFile?,
        @RequestParam("title") title: String,
        @RequestParam("subtitle") subtitle: String,
        @RequestParam("gradientColor", defaultValue = "slate") gradientColor: String,
        @RequestParam("isActive", defaultValue = "true") isActive: Boolean,
        @RequestParam("sortOrder", defaultValue = "0") sortOrder: Int
    ): ApiResponse<HeroSlideDto> {
        // 서브도메인 관리자는 자신의 팀에만 슬라이드 생성 가능
        if (adminInfo.adminLevel == AdminLevel.SUBDOMAIN) {
            val team = teamService.findByCode(adminInfo.teamSubdomain!!)
                ?: throw UnauthorizedAdminAccessException("Invalid team subdomain")
            
            if (teamId != team.id) {
                throw UnauthorizedAdminAccessException("Subdomain admin can only create slides for their own team")
            }
        }
        
        try {
            // 입력값 검증
            if (title.isBlank()) {
                throw BadRequestException("제목은 필수입니다.")
            }
            if (subtitle.isBlank()) {
                throw BadRequestException("부제목은 필수입니다.")
            }
            if (title.length > 100) {
                throw BadRequestException("제목은 100자를 초과할 수 없습니다.")
            }
            if (subtitle.length > 200) {
                throw BadRequestException("부제목은 200자를 초과할 수 없습니다.")
            }
            if (sortOrder < 0) {
                throw BadRequestException("정렬 순서는 0 이상이어야 합니다.")
            }
            
            // 그라데이션 색상 검증
            val validGradientColor = try {
                GradientColor.valueOf(gradientColor.uppercase())
            } catch (e: IllegalArgumentException) {
                throw BadRequestException("유효하지 않은 그라데이션 색상입니다: $gradientColor")
            }
            
            // 이미지 업로드 처리
            var backgroundImageUrl: String? = null
            if (file != null && !file.isEmpty) {
                val teamSubdomain = if (adminInfo.adminLevel == AdminLevel.SUBDOMAIN) {
                    adminInfo.teamSubdomain!!
                } else {
                    "default"
                }
                
                val uploadedImage = imageUploadService.upload(
                    file,
                    ImageUploadType.HERO_SLIDES,
                    UploadContext(teamSubdomain = teamSubdomain, resourceId = 0L)
                )
                backgroundImageUrl = uploadedImage.fileUrl
            }
            
            val request = CreateHeroSlideRequest(
                title = title,
                subtitle = subtitle,
                backgroundImage = backgroundImageUrl,
                gradientColor = validGradientColor,
                isActive = isActive,
                sortOrder = sortOrder
            )
            
            val slide = heroSlideService.createSlideForTeam(teamId, request)
            return ApiResponse.success(slide)
        } catch (e: IllegalArgumentException) {
            throw BadRequestException(e.message ?: "Invalid request")
        }
    }
    
    @AdminPermissionRequired(level = AdminLevel.SUBDOMAIN)
    @PutMapping("/{id}")
    fun updateSlide(
        @RequestAttribute adminInfo: AdminInfo,
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdateHeroSlideRequest
    ): ApiResponse<HeroSlideDto> {
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
            return ApiResponse.success(slide)
        } catch (e: IllegalArgumentException) {
            throw BadRequestException(e.message ?: "Invalid request")
        }
    }
    
    @AdminPermissionRequired(level = AdminLevel.SUBDOMAIN)
    @DeleteMapping("/{id}")
    fun deleteSlide(
        @RequestAttribute adminInfo: AdminInfo,
        @PathVariable id: Long
    ): ApiResponse<String> {
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
            return ApiResponse.success("deleted")
        } catch (e: IllegalArgumentException) {
            throw BadRequestException(e.message ?: "Invalid request")
        }
    }
    
    @AdminPermissionRequired(level = AdminLevel.SUBDOMAIN)
    @PutMapping("/sort-order")
    fun updateSortOrder(
        @RequestAttribute adminInfo: AdminInfo,
        @Valid @RequestBody request: UpdateSortOrderRequest
    ): ApiResponse<String> {
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
            return ApiResponse.success("updated")
        } catch (e: IllegalArgumentException) {
            throw BadRequestException(e.message ?: "Invalid request")
        }
    }
    
    /**
     * 히어로 슬라이드 이미지 업로드
     */
    @AdminPermissionRequired(level = AdminLevel.SUBDOMAIN)
    @PostMapping("/{id}/image")
    fun uploadSlideImage(
        @RequestAttribute adminInfo: AdminInfo,
        @PathVariable id: Long,
        @RequestParam("file") file: MultipartFile
    ): ApiResponse<Map<String, String>> {
        // 서브도메인 관리자는 자신의 팀 슬라이드만 업로드 가능
        if (adminInfo.adminLevel == AdminLevel.SUBDOMAIN) {
            val existingSlide = heroSlideService.getSlideById(id)
                ?: throw UnauthorizedAdminAccessException("Slide not found")
            
            val team = teamService.findByCode(adminInfo.teamSubdomain!!)
                ?: throw UnauthorizedAdminAccessException("Invalid team subdomain")
            
            if (existingSlide.teamId != team.id) {
                throw UnauthorizedAdminAccessException("Subdomain admin can only upload images for slides from their own team")
            }
        }
        
        try {
            val teamSubdomain = if (adminInfo.adminLevel == AdminLevel.SUBDOMAIN) {
                adminInfo.teamSubdomain!!
            } else {
                // MASTER인 경우 기본값 사용 (추후 개선 필요)
                "default"
            }
            
            val uploadedImage = imageUploadService.upload(
                file,
                ImageUploadType.HERO_SLIDES,
                UploadContext(teamSubdomain = teamSubdomain, resourceId = id)
            )
            
            return ApiResponse.success(mapOf(
                "fileName" to uploadedImage.fileName,
                "fileUrl" to uploadedImage.fileUrl,
                "filePath" to uploadedImage.filePath
            ))
        } catch (e: Exception) {
            throw BadRequestException("이미지 업로드 실패: ${e.message}")
        }
    }
}