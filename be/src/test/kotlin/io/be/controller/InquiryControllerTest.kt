package io.be.controller

import io.be.shared.controller.InquiryController
import io.be.inquiry.application.InquiryService
import io.be.inquiry.dto.CreateInquiryRequest
import io.be.inquiry.dto.InquiryDto
import io.be.inquiry.domain.InquiryStatus
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.BDDMockito.given
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.http.HttpStatus
import java.time.LocalDateTime
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

@ExtendWith(MockitoExtension::class)
class InquiryControllerTest {

    @Mock
    private lateinit var inquiryService: InquiryService

    @InjectMocks
    private lateinit var inquiryController: InquiryController

    @Test
    fun `createInquiry should create new inquiry successfully`() {
        // Given
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

        // When
        val response = inquiryController.createInquiry(request)

        // Then
        assertEquals(HttpStatus.OK, response.statusCode)
        assertNotNull(response.body)
        assertEquals(true, response.body!!.success)
        assertEquals("홍길동", response.body!!.data?.name)
        assertEquals("test@example.com", response.body!!.data?.email)
        assertEquals("무료 체험 신청이 완료되었습니다. 빠른 시일 내에 연락드리겠습니다.", response.body!!.message)
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

        // When
        val response = inquiryController.getInquiriesByEmail("test@example.com")

        // Then
        assertEquals(HttpStatus.OK, response.statusCode)
        assertNotNull(response.body)
        assertEquals(true, response.body!!.success)
        assertEquals("test@example.com", response.body!!.data?.get(0)?.email)
        assertEquals("문의 내역 조회 성공", response.body!!.message)
    }

    @Test
    fun `checkEmailExists should return true for existing email`() {
        // Given
        given(inquiryService.existsByEmail("existing@example.com")).willReturn(true)

        // When
        val response = inquiryController.checkEmailExists("existing@example.com")

        // Then
        assertEquals(HttpStatus.OK, response.statusCode)
        assertNotNull(response.body)
        assertEquals(true, response.body!!.success)
        assertEquals(true, response.body!!.data?.get("exists"))
        assertEquals("이미 신청된 이메일입니다", response.body!!.message)
    }

    @Test
    fun `checkEmailExists should return false for new email`() {
        // Given
        given(inquiryService.existsByEmail("new@example.com")).willReturn(false)

        // When
        val response = inquiryController.checkEmailExists("new@example.com")

        // Then
        assertEquals(HttpStatus.OK, response.statusCode)
        assertNotNull(response.body)
        assertEquals(true, response.body!!.success)
        assertEquals(false, response.body!!.data?.get("exists"))
        assertEquals("신청 가능한 이메일입니다", response.body!!.message)
    }
}