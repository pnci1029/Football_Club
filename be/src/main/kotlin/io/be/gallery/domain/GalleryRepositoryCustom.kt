package io.be.gallery.domain

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import java.time.LocalDate

interface GalleryRepositoryCustom {
    
    /**
     * 복합 조건으로 갤러리 검색
     * @param teamSubdomain 팀 서브도메인
     * @param keyword 제목/설명 검색 키워드
     * @param category 카테고리 필터
     * @param tags 태그 필터 (AND 조건)
     * @param startDate 시작일 필터
     * @param endDate 종료일 필터
     * @param pageable 페이지네이션
     */
    fun searchGalleries(
        teamSubdomain: String,
        keyword: String? = null,
        category: GalleryCategory? = null,
        tags: List<String>? = null,
        startDate: LocalDate? = null,
        endDate: LocalDate? = null,
        pageable: Pageable
    ): Page<Gallery>
    
    /**
     * 태그로 갤러리 검색 (OR 조건)
     * @param teamSubdomain 팀 서브도메인
     * @param tags 검색할 태그 리스트
     * @param pageable 페이지네이션
     */
    fun findGalleriesByTagsOr(
        teamSubdomain: String,
        tags: List<String>,
        pageable: Pageable
    ): Page<Gallery>
    
    /**
     * 인기 갤러리 조회 (조회수 기준)
     * @param teamSubdomain 팀 서브도메인
     * @param limit 조회할 개수
     */
    fun findPopularGalleries(
        teamSubdomain: String,
        limit: Int = 10
    ): List<Gallery>
    
    /**
     * 하이라이트 갤러리 조회 (평점 기준)
     * @param teamSubdomain 팀 서브도메인
     * @param playType 플레이 타입 필터
     * @param pageable 페이지네이션
     */
    fun findHighlightGalleries(
        teamSubdomain: String,
        playType: PlayType? = null,
        pageable: Pageable
    ): Page<Gallery>
    
    /**
     * 갤러리 통계 조회
     * @param teamSubdomain 팀 서브도메인
     */
    fun getGalleryStatistics(teamSubdomain: String): GalleryStatistics
}