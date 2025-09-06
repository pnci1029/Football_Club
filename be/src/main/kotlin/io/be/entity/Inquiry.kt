package io.be.entity

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.time.LocalDateTime

@Entity
@Table(name = "inquiries")
data class Inquiry(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    
    @Column(nullable = false)
    val name: String,
    
    @Column(nullable = false)
    val email: String,
    
    @Column(nullable = false)
    val phone: String,
    
    @Column(nullable = false)
    val teamName: String,
    
    val message: String? = null,
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val status: InquiryStatus = InquiryStatus.PENDING,
    
    @CreationTimestamp
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @UpdateTimestamp
    val updatedAt: LocalDateTime = LocalDateTime.now(),
    
    val processedAt: LocalDateTime? = null,
    
    val adminNote: String? = null
)

enum class InquiryStatus {
    PENDING,    // 대기중
    CONTACTED,  // 연락완료
    COMPLETED,  // 처리완료
    CANCELED    // 취소
}