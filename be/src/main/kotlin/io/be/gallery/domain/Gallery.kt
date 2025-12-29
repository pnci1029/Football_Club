package io.be.gallery.domain

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.time.LocalDateTime

@Entity
@Table(
    name = "gallery",
    indexes = [
        Index(name = "idx_gallery_team_subdomain", columnList = "teamSubdomain"),
        Index(name = "idx_gallery_category", columnList = "category"),
        Index(name = "idx_gallery_created_at", columnList = "createdAt"),
        Index(name = "idx_gallery_featured", columnList = "isFeatured"),
        Index(name = "idx_gallery_active", columnList = "isActive")
    ]
)
data class Gallery(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    
    @Column(name = "team_id", nullable = false)
    val teamId: Long,
    
    @Column(name = "team_subdomain", nullable = false, length = 50)
    val teamSubdomain: String,
    
    @Column(nullable = false, length = 200)
    val title: String,
    
    @Column(columnDefinition = "TEXT")
    val description: String? = null,
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    val category: GalleryCategory,
    
    @Column(name = "created_by", length = 100)
    val createdBy: String? = null,
    
    @Column(name = "view_count")
    val viewCount: Int = 0,
    
    @Column(name = "is_featured")
    val isFeatured: Boolean = false,
    
    @Column(name = "is_active")
    val isActive: Boolean = true,
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    val updatedAt: LocalDateTime = LocalDateTime.now(),
    
    @OneToMany(mappedBy = "gallery", cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
    val mediaFiles: List<GalleryMedia> = emptyList(),
    
    @OneToMany(mappedBy = "gallery", cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
    val tags: List<GalleryTag> = emptyList()
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