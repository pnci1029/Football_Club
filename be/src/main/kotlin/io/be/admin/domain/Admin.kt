package io.be.admin.domain

import jakarta.persistence.*
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.time.LocalDateTime

/**
 * 관리자 레벨 enum
 */
enum class AdminLevel {
    MASTER,     // 마스터 관리자 - 모든 서브도메인 접근 가능
    SUBDOMAIN   // 서브도메인 관리자 - 특정 서브도메인만 접근 가능
}

@Entity
@Table(name = "admins")
@EntityListeners(AuditingEntityListener::class)
data class Admin(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    
    @Column(unique = true, nullable = false)
    val username: String,
    
    @Column(nullable = false)
    val password: String,
    
    @Column(nullable = false)
    val role: String = "ADMIN",
    
    @Column(nullable = false)
    val isActive: Boolean = true,
    
    @Column(nullable = true)
    val email: String? = null,
    
    @Column(nullable = true)
    val name: String? = null,
    
    @Column(nullable = true, name = "team_subdomain")
    val teamSubdomain: String? = null, // 서브도메인별 관리자용 (null이면 마스터 관리자)
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "admin_level")
    val adminLevel: AdminLevel = AdminLevel.SUBDOMAIN, // 관리자 레벨
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @LastModifiedDate
    @Column(nullable = false)
    val updatedAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(nullable = true)
    val lastLoginAt: LocalDateTime? = null
)