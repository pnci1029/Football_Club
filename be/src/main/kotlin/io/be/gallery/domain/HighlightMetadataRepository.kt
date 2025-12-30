package io.be.gallery.domain

import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface HighlightMetadataRepository : JpaRepository<HighlightMetadata, Long> {
    
    /**
     * 갤러리별 하이라이트 메타데이터 조회
     */
    fun findByGalleryId(galleryId: Long): HighlightMetadata?
    
    /**
     * 경기별 하이라이트 메타데이터 조회
     */
    fun findByMatchIdOrderByGameMinuteAsc(matchId: Long): List<HighlightMetadata>
    
    /**
     * 플레이 타입별 하이라이트 조회 (팀별)
     */
    fun findByGalleryIdInAndPlayTypeOrderByHighlightRatingDesc(
        galleryIds: List<Long>,
        playType: PlayType
    ): List<HighlightMetadata>
    
    /**
     * 높은 평점 하이라이트 조회 (팀별)
     */
    fun findByGalleryIdInAndHighlightRatingGreaterThanEqualOrderByHighlightRatingDesc(
        galleryIds: List<Long>,
        minRating: Int
    ): List<HighlightMetadata>
    
    /**
     * 선수별 하이라이트 조회 (선수명 포함)
     */
    fun findByGalleryIdInAndPlayerNamesContaining(
        galleryIds: List<Long>,
        playerName: String
    ): List<HighlightMetadata>
    
    /**
     * 플레이 타입별 통계 조회
     */
    @Query("""
        SELECT hm.playType, COUNT(hm), AVG(hm.highlightRating) 
        FROM HighlightMetadata hm 
        WHERE hm.galleryId IN :galleryIds 
        GROUP BY hm.playType 
        ORDER BY COUNT(hm) DESC
    """)
    fun getPlayTypeStatistics(@Param("galleryIds") galleryIds: List<Long>): List<Array<Any>>
    
    /**
     * 최근 하이라이트 조회 (홈 대시보드용)
     */
    fun findByGalleryIdInOrderByCreatedAtDesc(
        galleryIds: List<Long>
    ): List<HighlightMetadata>
}