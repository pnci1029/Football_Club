package io.be.gallery.domain

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import java.time.LocalDateTime

@Entity
@Table(
    name = "gallery_media",
    indexes = [
        Index(name = "idx_media_gallery_id", columnList = "GALLERY_ID"),
        Index(name = "idx_media_type", columnList = "MEDIA_TYPE"),
        Index(name = "idx_media_sort_order", columnList = "SORT_ORDER"),
        Index(name = "idx_media_is_cover", columnList = "IS_COVER")
    ]
)
data class GalleryMedia(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "GALLERY_ID", nullable = false)
    val gallery: Gallery,

    @Column(name = "FILE_NAME", nullable = false, length = 255)
    val fileName: String,

    @Column(name = "ORIGINAL_FILE_NAME", nullable = false, length = 255)
    val originalFileName: String,

    @Column(name = "FILE_PATH", nullable = false, length = 500)
    val filePath: String,

    @Column(name = "FILE_URL", nullable = false, length = 500)
    val fileUrl: String,

    @Column(name = "FILE_SIZE", nullable = false)
    val fileSize: Long,

    @Column(name = "MIME_TYPE", nullable = false, length = 100)
    val mimeType: String,

    @Enumerated(EnumType.STRING)
    @Column(name = "MEDIA_TYPE", nullable = false)
    val mediaType: MediaType,

    @Column(name = "WIDTH")
    val width: Int? = null,
    
    @Column(name = "HEIGHT")
    val height: Int? = null,
    
    @Column(name = "DURATION")
    val duration: Int? = null, // 비디오 길이 (초)

    @Column(name = "THUMBNAIL_URL", length = 500)
    val thumbnailUrl: String? = null,

    @Column(name = "SORT_ORDER")
    val sortOrder: Int = 0,

    @Column(name = "IS_COVER")
    val isCover: Boolean = false,

    @Column(name = "UPLOADED_BY", length = 100)
    val uploadedBy: String? = null,

    @CreationTimestamp
    @Column(name = "UPLOADED_AT", nullable = false)
    val uploadedAt: LocalDateTime = LocalDateTime.now()
)

enum class MediaType {
    IMAGE, VIDEO
}
