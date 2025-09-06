package io.be.repository

import io.be.entity.Inquiry
import io.be.entity.InquiryStatus
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.time.LocalDateTime

@Repository
interface InquiryRepository : JpaRepository<Inquiry, Long>, InquiryRepositoryCustom {
    
    // 상태별 조회
    fun findByStatus(status: InquiryStatus, pageable: Pageable): Page<Inquiry>
    fun findByStatus(status: InquiryStatus): List<Inquiry>
    
    // 날짜 범위별 조회
    fun findByCreatedAtBetween(startDate: LocalDateTime, endDate: LocalDateTime, pageable: Pageable): Page<Inquiry>
    
    // 이메일로 조회
    fun findByEmail(email: String): List<Inquiry>
    fun existsByEmail(email: String): Boolean
    
    // 상태별 카운트
    fun countByStatus(status: InquiryStatus): Long
}

interface InquiryRepositoryCustom {
    fun findRecentInquiries(pageable: Pageable): Page<Inquiry>
    fun searchInquiries(
        name: String?,
        email: String?,
        teamName: String?,
        status: InquiryStatus?,
        pageable: Pageable
    ): Page<Inquiry>
}