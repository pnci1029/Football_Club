package io.be.gallery.domain

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface GalleryTagRepository : JpaRepository<GalleryTag, Long> {
    
    /**
     * 갤러리별 태그 조회
     */
    fun findByGalleryIdOrderByTagName(galleryId: Long): List<GalleryTag>
    
    /**
     * 여러 갤러리의 태그 조회
     */
    fun findByGalleryIdIn(galleryIds: List<Long>): List<GalleryTag>
    
    /**
     * 여러 갤러리의 태그 조회 (정렬)
     */
    fun findByGalleryIdInOrderByTagName(galleryIds: List<Long>): List<GalleryTag>
    
    /**
     * 갤러리별 태그명 리스트 조회
     */
    @Query("SELECT gt.tagName FROM GalleryTag gt WHERE gt.galleryId = :galleryId ORDER BY gt.tagName")
    fun findTagNamesByGalleryId(@Param("galleryId") galleryId: Long): List<String>
    
    /**
     * 특정 태그로 갤러리 ID 조회
     */
    @Query("SELECT DISTINCT gt.galleryId FROM GalleryTag gt WHERE gt.tagName = :tagName")
    fun findGalleryIdsByTagName(@Param("tagName") tagName: String): List<Long>
    
    /**
     * 갤러리와 태그명으로 태그 존재 확인
     */
    fun existsByGalleryIdAndTagName(galleryId: Long, tagName: String): Boolean
    
    /**
     * 갤러리별 태그 삭제
     */
    fun deleteByGalleryIdAndTagName(galleryId: Long, tagName: String)
    
    /**
     * 갤러리별 모든 태그 삭제
     */
    fun deleteByGalleryId(galleryId: Long)
}