package io.be.entity

import jakarta.persistence.*
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.time.LocalDateTime

@Entity
@Table(name = "community_posts")
@EntityListeners(AuditingEntityListener::class)
data class CommunityPost(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    
    @Column(nullable = false)
    val title: String,
    
    @Column(columnDefinition = "TEXT", nullable = false)
    val content: String,
    
    @Column(nullable = false, name = "author_name")
    val authorName: String,
    
    @Column(name = "author_email")
    val authorEmail: String? = null,
    
    @Column(name = "author_phone")
    val authorPhone: String? = null,
    
    @Column(name = "author_password_hash", nullable = false)
    val authorPasswordHash: String,
    
    @Column(nullable = false, name = "team_id")
    val teamId: Long, // 멀티테넌트 구분용
    
    @Column(name = "team_subdomain")
    val teamSubdomain: String? = null,
    
    @Column(name = "view_count", nullable = false)
    val viewCount: Int = 0,
    
    @Column(name = "is_notice", nullable = false)
    val isNotice: Boolean = false, // 공지사항 여부
    
    @Column(name = "is_active", nullable = false)
    val isActive: Boolean = true, // 활성화 여부 (삭제 대신 비활성화)
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    val updatedAt: LocalDateTime = LocalDateTime.now()
) {
    // JPA를 위한 기본 생성자
    constructor() : this(
        title = "",
        content = "",
        authorName = "",
        teamId = 0L,
        teamSubdomain = null,
        authorPasswordHash = ""
    )
}

@Entity
@Table(name = "community_comments")
@EntityListeners(AuditingEntityListener::class)
data class CommunityComment(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    val post: CommunityPost,
    
    @Column(columnDefinition = "TEXT", nullable = false)
    val content: String,
    
    @Column(nullable = false, name = "author_name")
    val authorName: String,
    
    @Column(name = "author_email")
    val authorEmail: String? = null,
    
    @Column(name = "author_password_hash", nullable = false)
    val authorPasswordHash: String,
    
    @Column(name = "is_active", nullable = false)
    val isActive: Boolean = true,
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    val updatedAt: LocalDateTime = LocalDateTime.now()
) {
    // JPA를 위한 기본 생성자
    constructor() : this(
        post = CommunityPost(),
        content = "",
        authorName = "",
        authorPasswordHash = ""
    )
}