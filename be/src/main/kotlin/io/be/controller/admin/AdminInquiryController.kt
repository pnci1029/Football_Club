package io.be.controller.admin

import io.be.dto.InquiryDto
import io.be.dto.InquirySearchRequest
import io.be.dto.UpdateInquiryStatusRequest
import io.be.entity.InquiryStatus
import io.be.service.InquiryService
import io.be.util.ApiResponse
import io.be.util.PagedResponse
import io.be.util.PageMetadata
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v1/admin/inquiries")
@CrossOrigin(origins = ["*"])
class AdminInquiryController(
    private val inquiryService: InquiryService
) {

    /**
     * 모든 문의 조회 (페이징)
     */
    @GetMapping
    fun getAllInquiries(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(required = false) status: InquiryStatus?,
        @RequestParam(required = false) name: String?,
        @RequestParam(required = false) email: String?,
        @RequestParam(required = false) teamName: String?
    ): ResponseEntity<ApiResponse<PagedResponse<InquiryDto>>> {
        val searchRequest = InquirySearchRequest(
            name = name,
            email = email,
            teamName = teamName,
            status = status,
            page = page,
            size = size
        )
        
        val inquiries = inquiryService.searchInquiries(searchRequest)
        
        val filters = mutableMapOf<String, Any>()
        status?.let { filters["status"] = it }
        name?.let { filters["name"] = it }
        email?.let { filters["email"] = it }
        teamName?.let { filters["teamName"] = it }
        
        val metadata = PageMetadata(
            filters = filters.takeIf { it.isNotEmpty() },
            additionalInfo = mapOf("context" to "admin")
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
    @GetMapping("/{id}")
    fun getInquiry(@PathVariable id: Long): ResponseEntity<ApiResponse<InquiryDto>> {
        val inquiry = inquiryService.findInquiryById(id)
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
    @PatchMapping("/{id}/status")
    fun updateInquiryStatus(
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdateInquiryStatusRequest
    ): ResponseEntity<ApiResponse<InquiryDto>> {
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
    @GetMapping("/status/{status}")
    fun getInquiriesByStatus(
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
    @GetMapping("/stats")
    fun getInquiryStats(): ResponseEntity<ApiResponse<Map<String, Any>>> {
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
    @GetMapping("/recent")
    fun getRecentInquiries(
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
}