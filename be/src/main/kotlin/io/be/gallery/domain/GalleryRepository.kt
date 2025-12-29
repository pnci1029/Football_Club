package io.be.gallery.domain

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface GalleryRepository : JpaRepository<Gallery, Long>, GalleryRepositoryCustom {
    
    /**
     * 팀별 활성 갤러리 목록 조회 (최신순)
     */
    fun findByTeamSubdomainAndIsActiveTrueOrderByCreatedAtDesc(
        teamSubdomain: String,
        pageable: Pageable
    ): Page<Gallery>
    
    /**
     * 팀별 카테고리별 활성 갤러리 목록 조회 (최신순)
     */
    fun findByTeamSubdomainAndCategoryAndIsActiveTrueOrderByCreatedAtDesc(
        teamSubdomain: String,
        category: GalleryCategory,
        pageable: Pageable
    ): Page<Gallery>
    
    /**
     * 팀별 추천 갤러리 목록 조회 (최신순)
     */
    fun findByTeamSubdomainAndIsFeaturedTrueAndIsActiveTrueOrderByCreatedAtDesc(
        teamSubdomain: String
    ): List<Gallery>
    
    /**
     * 특정 갤러리의 조회수 증가
     */
    @Modifying
    @Query("UPDATE Gallery g SET g.viewCount = g.viewCount + 1 WHERE g.id = :galleryId")
    fun incrementViewCount(@Param("galleryId") galleryId: Long)
    
    /**
     * 팀별 갤러리 총 개수 조회
     */
    fun countByTeamSubdomainAndIsActiveTrue(teamSubdomain: String): Long
    
    /**
     * 팀별 카테고리별 갤러리 개수 조회
     */
    fun countByTeamSubdomainAndCategoryAndIsActiveTrue(
        teamSubdomain: String, 
        category: GalleryCategory
    ): Long
    
    /**
     * 최근 생성된 갤러리 조회 (홈 대시보드용)
     */
    @Query("""
        SELECT g FROM Gallery g 
        WHERE g.teamSubdomain = :teamSubdomain 
        AND g.isActive = true 
        ORDER BY g.createdAt DESC
    """)
    fun findRecentGalleries(
        @Param("teamSubdomain") teamSubdomain: String,
        pageable: Pageable
    ): List<Gallery>
}