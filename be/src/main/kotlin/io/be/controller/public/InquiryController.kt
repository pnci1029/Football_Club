package io.be.controller.public

import io.be.dto.CreateInquiryRequest
import io.be.dto.InquiryDto
import io.be.service.InquiryService
import io.be.util.ApiResponse
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v1/inquiries")
@CrossOrigin(origins = ["*"])
class InquiryController(
    private val inquiryService: InquiryService
) {

    /**
     * 무료 체험 신청 (메인 호스트에서 사용)
     */
    @PostMapping
    fun createInquiry(
        @Valid @RequestBody request: CreateInquiryRequest
    ): ResponseEntity<ApiResponse<InquiryDto>> {
        val inquiry = inquiryService.createInquiry(request)
        return ResponseEntity.ok(
            ApiResponse.success(
                data = inquiry,
                message = "무료 체험 신청이 완료되었습니다. 빠른 시일 내에 연락드리겠습니다."
            )
        )
    }

    /**
     * 이메일로 본인의 문의 내역 조회
     */
    @GetMapping("/email/{email}")
    fun getInquiriesByEmail(
        @PathVariable email: String
    ): ResponseEntity<ApiResponse<List<InquiryDto>>> {
        val inquiries = inquiryService.findInquiriesByEmail(email)
        return ResponseEntity.ok(
            ApiResponse.success(
                data = inquiries,
                message = "문의 내역 조회 성공"
            )
        )
    }

    /**
     * 이메일 중복 확인 (중복 신청 방지)
     */
    @GetMapping("/check-email/{email}")
    fun checkEmailExists(
        @PathVariable email: String
    ): ResponseEntity<ApiResponse<Map<String, Boolean>>> {
        val exists = inquiryService.existsByEmail(email)
        return ResponseEntity.ok(
            ApiResponse.success(
                data = mapOf("exists" to exists),
                message = if (exists) "이미 신청된 이메일입니다" else "신청 가능한 이메일입니다"
            )
        )
    }
}