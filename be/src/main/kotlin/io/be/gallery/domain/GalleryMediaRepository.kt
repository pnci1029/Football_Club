package io.be.gallery.domain

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface GalleryMediaRepository : JpaRepository<GalleryMedia, Long> {
    
    /**
     * 갤러리별 미디어 파일 조회 (정렬 순서 기준)
     */
    fun findByGalleryIdOrderBySortOrder(galleryId: Long): List<GalleryMedia>
    
    /**
     * 갤러리의 커버 이미지 조회
     */
    fun findByGalleryIdAndIsCoverTrue(galleryId: Long): GalleryMedia?
    
    /**
     * 갤러리별 미디어 타입별 파일 조회
     */
    fun findByGalleryIdAndMediaTypeOrderBySortOrder(
        galleryId: Long, 
        mediaType: MediaType
    ): List<GalleryMedia>
    
    /**
     * 갤러리별 미디어 파일 개수 조회
     */
    fun countByGalleryId(galleryId: Long): Long
    
    /**
     * 갤러리별 미디어 타입별 파일 개수 조회
     */
    fun countByGalleryIdAndMediaType(galleryId: Long, mediaType: MediaType): Long
    
    /**
     * 특정 갤러리의 미디어 파일 삭제
     */
    fun deleteByGalleryId(galleryId: Long)
}