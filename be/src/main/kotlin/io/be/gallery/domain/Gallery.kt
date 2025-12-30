package io.be.gallery.domain

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.time.LocalDateTime

@Entity
@Table(
    name = "galleries",
    indexes = [
        Index(name = "idx_gallery_team_subdomain", columnList = "TEAM_SUBDOMAIN"),
        Index(name = "idx_gallery_category", columnList = "CATEGORY"),
        Index(name = "idx_gallery_created_at", columnList = "CREATED_AT"),
        Index(name = "idx_gallery_featured", columnList = "IS_FEATURED"),
        Index(name = "idx_gallery_active", columnList = "IS_ACTIVE")
    ]
)
data class Gallery(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    
    @Column(name = "TEAM_ID", nullable = false)
    val teamId: Long,
    
    @Column(name = "TEAM_SUBDOMAIN", nullable = false, length = 50)
    val teamSubdomain: String,
    
    @Column(name = "TITLE", nullable = false, length = 200)
    val title: String,
    
    @Column(name = "DESCRIPTION", columnDefinition = "TEXT")
    val description: String? = null,
    
    @Enumerated(EnumType.STRING)
    @Column(name = "CATEGORY", nullable = false, length = 50)
    val category: GalleryCategory,
    
    @Column(name = "CREATED_BY", length = 100)
    val createdBy: String? = null,
    
    @Column(name = "VIEW_COUNT")
    val viewCount: Int = 0,
    
    @Column(name = "IS_FEATURED")
    val isFeatured: Boolean = false,
    
    @Column(name = "IS_ACTIVE")
    val isActive: Boolean = true,
    
    @CreationTimestamp
    @Column(name = "CREATED_AT", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @UpdateTimestamp
    @Column(name = "UPDATED_AT", nullable = false)
    val updatedAt: LocalDateTime = LocalDateTime.now(),
    
)

enum class GalleryCategory(
    val code: String,
    val displayName: String,
    val description: String
) {
    MATCH("MATCH", "경기", "경기 관련 사진 및 영상"),
    TRAINING("TRAINING", "훈련", "팀 훈련 모습"),
    EVENT("EVENT", "행사", "팀 행사 및 모임"),
    PLAYER("PLAYER", "선수", "선수 개인 사진"),
    FACILITY("FACILITY", "시설", "구장 및 시설 사진"),
    ACHIEVEMENT("ACHIEVEMENT", "수상", "트로피 및 수상 관련"),
    HIGHLIGHT("HIGHLIGHT", "하이라이트", "경기 하이라이트 영상"),
    ETC("ETC", "기타", "기타 사진")
}