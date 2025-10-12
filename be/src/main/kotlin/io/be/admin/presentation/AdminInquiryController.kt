package io.be.admin.presentation

import io.be.admin.dto.AdminInfo
import io.be.admin.domain.AdminLevel
import io.be.inquiry.dto.InquiryDto
import io.be.inquiry.dto.InquirySearchRequest
import io.be.inquiry.dto.UpdateInquiryStatusRequest
import io.be.inquiry.domain.InquiryStatus
import io.be.inquiry.application.InquiryService
import io.be.shared.exception.UnauthorizedAdminAccessException
import io.be.shared.security.AdminPermissionRequired
import io.be.shared.util.ApiResponse
import io.be.shared.util.PagedResponse
import io.be.shared.util.PageMetadata
import io.be.team.application.TeamService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v1/admin/inquiries")
@CrossOrigin(origins = ["*"])
class AdminInquiryController(
    private val inquiryService: InquiryService,
    private val teamService: TeamService
) {

    /**
     * 모든 문의 조회 (페이징)
     */
    @AdminPermissionRequired(level = AdminLevel.SUBDOMAIN)
    @GetMapping
    fun getAllInquiries(
        adminInfo: AdminInfo,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(required = false) status: InquiryStatus?,
        @RequestParam(required = false) name: String?,
        @RequestParam(required = false) email: String?,
        @RequestParam(required = false) teamName: String?
    ): ResponseEntity<ApiResponse<PagedResponse<InquiryDto>>> {
        
        // 권한별 teamName 결정
        val actualTeamName = when (adminInfo.adminLevel) {
            AdminLevel.MASTER -> {
                // 마스터는 모든 팀 문의 조회 가능
                teamName
            }
            AdminLevel.SUBDOMAIN -> {
                // 서브도메인 관리자는 자신의 팀 문의만 조회
                val team = teamService.findByCode(adminInfo.teamSubdomain!!)
                    ?: throw UnauthorizedAdminAccessException("Invalid team subdomain")
                
                // 요청한 teamName이 있다면 자신의 팀인지 검증
                if (teamName != null && teamName != team.name) {
                    throw UnauthorizedAdminAccessException("Subdomain admin can only access inquiries for their own team")
                }
                team.name
            }
        }
        
        val searchRequest = InquirySearchRequest(
            name = name,
            email = email,
            teamName = actualTeamName,
            status = status,
            page = page,
            size = size
        )
        
        val inquiries = inquiryService.searchInquiries(searchRequest)
        
        val filters = mutableMapOf<String, Any>()
        status?.let { filters["status"] = it }
        name?.let { filters["name"] = it }
        email?.let { filters["email"] = it }
        actualTeamName?.let { filters["teamName"] = it }
        
        val metadata = PageMetadata(
            filters = filters.takeIf { it.isNotEmpty() },
            additionalInfo = mapOf(
                "context" to "admin",
                "adminLevel" to adminInfo.adminLevel.name
            )
        )
        
        val pagedResponse = PagedResponse.of(inquiries, metadata)
        return ResponseEntity.ok(
            ApiResponse.success(
                data = pagedResponse,
                message = "문의 목록 조회 성공"
            )
        )
    }

    /**
     * 특정 문의 상세 조회
     */
    @AdminPermissionRequired(level = AdminLevel.SUBDOMAIN)
    @GetMapping("/{id}")
    fun getInquiry(
        adminInfo: AdminInfo,
        @PathVariable id: Long
    ): ResponseEntity<ApiResponse<InquiryDto>> {
        val inquiry = inquiryService.findInquiryById(id)
        
        // 서브도메인 관리자는 자신의 팀 문의만 조회 가능
        if (adminInfo.adminLevel == AdminLevel.SUBDOMAIN) {
            val team = teamService.findByCode(adminInfo.teamSubdomain!!)
                ?: throw UnauthorizedAdminAccessException("Invalid team subdomain")
            
            if (inquiry.teamName != team.name) {
                throw UnauthorizedAdminAccessException("Subdomain admin can only access inquiries from their own team")
            }
        }
        
        return ResponseEntity.ok(
            ApiResponse.success(
                data = inquiry,
                message = "문의 상세 조회 성공"
            )
        )
    }

    /**
     * 문의 상태 변경
     */
    @AdminPermissionRequired(level = AdminLevel.SUBDOMAIN)
    @PatchMapping("/{id}/status")
    fun updateInquiryStatus(
        adminInfo: AdminInfo,
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdateInquiryStatusRequest
    ): ResponseEntity<ApiResponse<InquiryDto>> {
        // 서브도메인 관리자는 자신의 팀 문의만 수정 가능
        if (adminInfo.adminLevel == AdminLevel.SUBDOMAIN) {
            val inquiry = inquiryService.findInquiryById(id)
            val team = teamService.findByCode(adminInfo.teamSubdomain!!)
                ?: throw UnauthorizedAdminAccessException("Invalid team subdomain")
            
            if (inquiry.teamName != team.name) {
                throw UnauthorizedAdminAccessException("Subdomain admin can only update inquiries from their own team")
            }
        }
        
        val updatedInquiry = inquiryService.updateInquiryStatus(id, request)
        return ResponseEntity.ok(
            ApiResponse.success(
                data = updatedInquiry,
                message = "문의 상태 변경 완료"
            )
        )
    }

    /**
     * 상태별 문의 조회
     */
    @AdminPermissionRequired(level = AdminLevel.SUBDOMAIN)
    @GetMapping("/status/{status}")
    fun getInquiriesByStatus(
        adminInfo: AdminInfo,
        @PathVariable status: InquiryStatus,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ): ResponseEntity<ApiResponse<PagedResponse<InquiryDto>>> {
        val inquiries = inquiryService.findInquiriesByStatus(status, page, size)
        
        val metadata = PageMetadata(
            filters = mapOf("status" to status),
            additionalInfo = mapOf("context" to "admin")
        )
        
        val pagedResponse = PagedResponse.of(inquiries, metadata)
        return ResponseEntity.ok(
            ApiResponse.success(
                data = pagedResponse,
                message = "${status.name} 상태의 문의 목록 조회 성공"
            )
        )
    }

    /**
     * 문의 통계 조회
     */
    @AdminPermissionRequired(level = AdminLevel.SUBDOMAIN)
    @GetMapping("/stats")
    fun getInquiryStats(
        adminInfo: AdminInfo
    ): ResponseEntity<ApiResponse<Map<String, Any>>> {
        val stats = inquiryService.getInquiryStats()
        return ResponseEntity.ok(
            ApiResponse.success(
                data = stats,
                message = "문의 통계 조회 성공"
            )
        )
    }

    /**
     * 대시보드용 최근 문의 조회
     */
    @AdminPermissionRequired(level = AdminLevel.SUBDOMAIN)
    @GetMapping("/recent")
    fun getRecentInquiries(
        adminInfo: AdminInfo,
        @RequestParam(defaultValue = "5") limit: Int
    ): ResponseEntity<ApiResponse<List<InquiryDto>>> {
        val inquiries = inquiryService.findAllInquiries(0, limit)
        return ResponseEntity.ok(
            ApiResponse.success(
                data = inquiries.content,
                message = "최근 문의 조회 성공"
            )
        )
    }

    /**
     * 문의 삭제
     */
    @AdminPermissionRequired(level = AdminLevel.SUBDOMAIN)
    @DeleteMapping("/{id}")
    fun deleteInquiry(
        adminInfo: AdminInfo,
        @PathVariable id: Long
    ): ResponseEntity<ApiResponse<Unit>> {
        // 서브도메인 관리자는 자신의 팀 문의만 삭제 가능
        if (adminInfo.adminLevel == AdminLevel.SUBDOMAIN) {
            val inquiry = inquiryService.findInquiryById(id)
            val team = teamService.findByCode(adminInfo.teamSubdomain!!)
                ?: throw UnauthorizedAdminAccessException("Invalid team subdomain")
            
            if (inquiry.teamName != team.name) {
                throw UnauthorizedAdminAccessException("Subdomain admin can only delete inquiries from their own team")
            }
        }
        
        inquiryService.deleteInquiry(id)
        return ResponseEntity.ok(
            ApiResponse.success(
                data = Unit,
                message = "문의가 성공적으로 삭제되었습니다"
            )
        )
    }
}