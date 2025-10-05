package io.be.notice.domain

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "notices")
data class Notice(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    
    @Column(nullable = false, length = 200)
    val title: String,
    
    @Column(nullable = false, columnDefinition = "TEXT")
    val content: String,
    
    @Column(name = "author_name", nullable = false, length = 50)
    val authorName: String,
    
    @Column(name = "author_email", length = 100)
    val authorEmail: String? = null,
    
    @Column(name = "author_phone", length = 20)
    val authorPhone: String? = null,
    
    @Column(name = "author_password_hash", nullable = false)
    val authorPasswordHash: String,
    
    @Column(name = "team_id", nullable = false)
    val teamId: Long,
    
    @Column(name = "team_subdomain", length = 50)
    val teamSubdomain: String? = null,
    
    @Column(name = "view_count", nullable = false)
    val viewCount: Int = 0,
    
    @Column(name = "is_active", nullable = false)
    val isActive: Boolean = true,
    
    @Column(name = "is_global_visible", nullable = false)
    val isGlobalVisible: Boolean = false,
    
    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(name = "updated_at", nullable = false)
    val updatedAt: LocalDateTime = LocalDateTime.now()
)