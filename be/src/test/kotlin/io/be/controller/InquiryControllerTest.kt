package io.be.controller

import com.fasterxml.jackson.databind.ObjectMapper
import io.be.shared.controller.InquiryController
import io.be.inquiry.application.InquiryService
import io.be.inquiry.dto.CreateInquiryRequest
import io.be.inquiry.dto.InquiryDto
import io.be.inquiry.domain.InquiryStatus
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.mockito.kotlin.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.test.context.TestPropertySource
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import java.time.LocalDateTime

@WebMvcTest(InquiryController::class)
@WithMockUser
@TestPropertySource(properties = [
    "spring.jpa.hibernate.ddl-auto=none",
    "spring.datasource.url=jdbc:h2:mem:testdb"
])
class InquiryControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var inquiryService: InquiryService

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Test
    fun `createInquiry should create new inquiry successfully`() {
        val request = CreateInquiryRequest(
            name = "홍길동",
            email = "test@example.com",
            phone = "010-1234-5678",
            teamName = "테스트 팀",
            message = "무료 체험을 신청합니다"
        )
        val inquiryDto = InquiryDto(
            id = 1L,
            name = "홍길동",
            email = "test@example.com",
            phone = "010-1234-5678",
            teamName = "테스트 팀",
            message = "무료 체험을 신청합니다",
            status = InquiryStatus.PENDING,
            createdAt = LocalDateTime.now(),
            updatedAt = LocalDateTime.now(),
            processedAt = null,
            adminNote = null
        )
        
        given(inquiryService.createInquiry(request)).willReturn(inquiryDto)

        mockMvc.perform(post("/v1/inquiries")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.name").value("홍길동"))
            .andExpect(jsonPath("$.data.email").value("test@example.com"))
            .andExpect(jsonPath("$.message").value("무료 체험 신청이 완료되었습니다. 빠른 시일 내에 연락드리겠습니다."))
    }

    @Test
    fun `getInquiriesByEmail should return inquiries for valid email`() {
        val inquiryDto = InquiryDto(
            id = 1L,
            name = "홍길동",
            email = "test@example.com", 
            phone = "010-1234-5678",
            teamName = "테스트 팀",
            message = "무료 체험을 신청합니다",
            status = InquiryStatus.PENDING,
            createdAt = LocalDateTime.now(),
            updatedAt = LocalDateTime.now(),
            processedAt = null,
            adminNote = null
        )
        
        given(inquiryService.findInquiriesByEmail("test@example.com")).willReturn(listOf(inquiryDto))

        mockMvc.perform(get("/v1/inquiries/email/test@example.com"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data[0].email").value("test@example.com"))
            .andExpect(jsonPath("$.message").value("문의 내역 조회 성공"))
    }

    @Test
    fun `checkEmailExists should return true for existing email`() {
        given(inquiryService.existsByEmail("existing@example.com")).willReturn(true)

        mockMvc.perform(get("/v1/inquiries/check-email/existing@example.com"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.exists").value(true))
            .andExpect(jsonPath("$.message").value("이미 신청된 이메일입니다"))
    }

    @Test
    fun `checkEmailExists should return false for new email`() {
        given(inquiryService.existsByEmail("new@example.com")).willReturn(false)

        mockMvc.perform(get("/v1/inquiries/check-email/new@example.com"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.exists").value(false))
            .andExpect(jsonPath("$.message").value("신청 가능한 이메일입니다"))
    }
}