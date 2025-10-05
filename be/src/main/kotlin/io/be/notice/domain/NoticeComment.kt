package io.be.notice.domain

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "notice_comments")
data class NoticeComment(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "notice_id", nullable = false)
    val notice: Notice,
    
    @Column(nullable = false, columnDefinition = "TEXT")
    val content: String,
    
    @Column(name = "author_name", nullable = false, length = 50)
    val authorName: String,
    
    @Column(name = "author_email", length = 100)
    val authorEmail: String? = null,
    
    @Column(name = "author_password_hash", nullable = false)
    val authorPasswordHash: String,
    
    @Column(name = "is_active", nullable = false)
    val isActive: Boolean = true,
    
    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(name = "updated_at", nullable = false)
    val updatedAt: LocalDateTime = LocalDateTime.now()
)