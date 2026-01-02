package io.be.shared.controller

import io.be.inquiry.dto.CreateInquiryRequest
import io.be.inquiry.dto.InquiryDto
import io.be.inquiry.application.InquiryService
import jakarta.validation.Valid
import io.be.shared.util.ApiResponse
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
    ): ApiResponse<InquiryDto> {
        val inquiry = inquiryService.createInquiry(request)
        return ApiResponse.success(inquiry)
    }

    /**
     * 이메일로 본인의 문의 내역 조회
     */
    @GetMapping("/email/{email}")
    fun getInquiriesByEmail(
        @PathVariable email: String
    ): ApiResponse<List<InquiryDto>> {
        val inquiries = inquiryService.findInquiriesByEmail(email)
        return ApiResponse.success(inquiries)
    }

    /**
     * 이메일 중복 확인 (중복 신청 방지)
     */
    @GetMapping("/check-email/{email}")
    fun checkEmailExists(
        @PathVariable email: String
    ): ApiResponse<Map<String, Boolean>> {
        val exists = inquiryService.existsByEmail(email)
        return ApiResponse.success(mapOf("exists" to exists))
    }
}