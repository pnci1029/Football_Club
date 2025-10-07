package io.be.inquiry.application

import io.be.inquiry.dto.CreateInquiryRequest
import io.be.inquiry.dto.InquiryDto
import io.be.inquiry.dto.InquirySearchRequest
import io.be.inquiry.dto.UpdateInquiryStatusRequest
import io.be.inquiry.domain.Inquiry
import io.be.inquiry.domain.InquiryStatus
import io.be.shared.exception.InquiryNotFoundException
import io.be.inquiry.domain.InquiryRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
@Transactional(readOnly = true)
class InquiryService(
    private val inquiryRepository: InquiryRepository
) {

    @Transactional
    fun createInquiry(request: CreateInquiryRequest): InquiryDto {
        val inquiry = Inquiry(
            name = request.name,
            email = request.email,
            phone = request.phone,
            teamName = request.teamName,
            message = request.message,
            status = InquiryStatus.PENDING
        )
        
        val savedInquiry = inquiryRepository.save(inquiry)
        return InquiryDto.from(savedInquiry)
    }

    fun findInquiryById(id: Long): InquiryDto {
        val inquiry = inquiryRepository.findById(id).orElseThrow {
            InquiryNotFoundException(id)
        }
        return InquiryDto.from(inquiry)
    }

    fun findAllInquiries(page: Int = 0, size: Int = 20): Page<InquiryDto> {
        val pageable = PageRequest.of(page, size)
        return inquiryRepository.findRecentInquiries(pageable).map { InquiryDto.from(it) }
    }

    fun findInquiriesByStatus(status: InquiryStatus, page: Int = 0, size: Int = 20): Page<InquiryDto> {
        val pageable = PageRequest.of(page, size)
        return inquiryRepository.findByStatus(status, pageable).map { InquiryDto.from(it) }
    }

    fun searchInquiries(searchRequest: InquirySearchRequest): Page<InquiryDto> {
        val pageable = PageRequest.of(searchRequest.page, searchRequest.size)
        return inquiryRepository.searchInquiries(
            name = searchRequest.name,
            email = searchRequest.email,
            teamName = searchRequest.teamName,
            status = searchRequest.status,
            pageable = pageable
        ).map { InquiryDto.from(it) }
    }

    @Transactional
    fun updateInquiryStatus(id: Long, request: UpdateInquiryStatusRequest): InquiryDto {
        val inquiry = inquiryRepository.findById(id).orElseThrow {
            InquiryNotFoundException(id)
        }
        
        val updatedInquiry = inquiry.copy(
            status = request.status,
            adminNote = request.adminNote,
            processedAt = if (request.status != InquiryStatus.PENDING) LocalDateTime.now() else null
        )
        
        val savedInquiry = inquiryRepository.save(updatedInquiry)
        return InquiryDto.from(savedInquiry)
    }

    fun getInquiryStats(): Map<String, Any> {
        val totalCount = inquiryRepository.count()
        val pendingCount = inquiryRepository.countByStatus(InquiryStatus.PENDING)
        val contactedCount = inquiryRepository.countByStatus(InquiryStatus.CONTACTED)
        val completedCount = inquiryRepository.countByStatus(InquiryStatus.COMPLETED)
        val canceledCount = inquiryRepository.countByStatus(InquiryStatus.CANCELED)
        
        return mapOf(
            "total" to totalCount,
            "pending" to pendingCount,
            "contacted" to contactedCount,
            "completed" to completedCount,
            "canceled" to canceledCount
        )
    }

    fun findInquiriesByEmail(email: String): List<InquiryDto> {
        return inquiryRepository.findByEmail(email).map { InquiryDto.from(it) }
    }

    fun existsByEmail(email: String): Boolean {
        return inquiryRepository.existsByEmail(email)
    }

    @Transactional
    fun deleteInquiry(id: Long) {
        val inquiry = inquiryRepository.findById(id).orElseThrow {
            InquiryNotFoundException(id)
        }
        inquiryRepository.delete(inquiry)
    }
}