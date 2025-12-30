package io.be.gallery.domain

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import java.time.LocalDateTime

@Entity
@Table(
    name = "gallery_tag",
    indexes = [
        Index(name = "idx_tag_gallery_id", columnList = "GALLERY_ID"),
        Index(name = "idx_tag_name", columnList = "TAG_NAME")
    ],
    uniqueConstraints = [
        UniqueConstraint(name = "uk_gallery_tag", columnNames = ["GALLERY_ID", "TAG_NAME"])
    ]
)
data class GalleryTag(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    
    @Column(name = "GALLERY_ID", nullable = false)
    val galleryId: Long,
    
    @Column(name = "TAG_NAME", nullable = false, length = 50)
    val tagName: String,
    
    @CreationTimestamp
    @Column(name = "CREATED_AT", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
)