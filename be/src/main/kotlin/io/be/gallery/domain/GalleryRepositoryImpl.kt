package io.be.gallery.domain

import com.querydsl.core.BooleanBuilder
import com.querydsl.jpa.impl.JPAQueryFactory
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Repository
import java.time.LocalDate

@Repository
class GalleryRepositoryImpl(
    private val queryFactory: JPAQueryFactory
) : GalleryRepositoryCustom {
    
    private val gallery = QGallery("gallery")
    private val galleryTag = QGalleryTag("galleryTag") 
    private val galleryMedia = QGalleryMedia("galleryMedia")
    private val highlightMetadata = QHighlightMetadata("highlightMetadata")
    
    override fun searchGalleries(
        teamSubdomain: String,
        keyword: String?,
        category: GalleryCategory?,
        tags: List<String>?,
        startDate: LocalDate?,
        endDate: LocalDate?,
        pageable: Pageable
    ): Page<Gallery> {
        val builder = BooleanBuilder()
        
        // 기본 조건: 팀 서브도메인과 활성 상태
        builder.and(gallery.teamSubdomain.eq(teamSubdomain))
        builder.and(gallery.isActive.isTrue)
        
        // 키워드 검색 (제목 또는 설명)
        keyword?.let {
            if (it.isNotBlank()) {
                builder.and(
                    gallery.title.containsIgnoreCase(it)
                        .or(gallery.description.containsIgnoreCase(it))
                )
            }
        }
        
        // 카테고리 필터
        category?.let {
            builder.and(gallery.category.eq(it))
        }
        
        // 날짜 범위 필터
        startDate?.let {
            builder.and(gallery.createdAt.goe(it.atStartOfDay()))
        }
        endDate?.let {
            builder.and(gallery.createdAt.lt(it.plusDays(1).atStartOfDay()))
        }
        
        // 태그 필터가 있는 경우 - 조인 대신 서브쿼리 사용
        if (!tags.isNullOrEmpty()) {
            val galleryIdsWithTags = queryFactory
                .select(galleryTag.galleryId)
                .from(galleryTag)
                .where(galleryTag.tagName.`in`(tags))
                .groupBy(galleryTag.galleryId)
                .having(galleryTag.galleryId.count().eq(tags.size.toLong())) // AND 조건
                .fetch()
            
            if (galleryIdsWithTags.isNotEmpty()) {
                builder.and(gallery.id.`in`(galleryIdsWithTags))
            } else {
                // 해당하는 갤러리가 없으면 빈 결과 반환
                builder.and(gallery.id.eq(-1L))
            }
        }
        
        val results = queryFactory
            .selectFrom(gallery)
            .where(builder)
            .orderBy(gallery.createdAt.desc())
            .offset(pageable.offset)
            .limit(pageable.pageSize.toLong())
            .fetch()
        
        val total = queryFactory
            .select(gallery.count())
            .from(gallery)
            .where(builder)
            .fetchOne() ?: 0L
        
        return PageImpl(results, pageable, total)
    }
    
    override fun findGalleriesByTagsOr(
        teamSubdomain: String,
        tags: List<String>,
        pageable: Pageable
    ): Page<Gallery> {
        // OR 조건으로 태그 검색 - 서브쿼리 사용
        val galleryIdsWithAnyTag = queryFactory
            .select(galleryTag.galleryId)
            .from(galleryTag)
            .where(galleryTag.tagName.`in`(tags))
            .distinct()
            .fetch()
        
        val builder = BooleanBuilder()
        builder.and(gallery.teamSubdomain.eq(teamSubdomain))
        builder.and(gallery.isActive.isTrue)
        
        if (galleryIdsWithAnyTag.isNotEmpty()) {
            builder.and(gallery.id.`in`(galleryIdsWithAnyTag))
        } else {
            builder.and(gallery.id.eq(-1L))
        }
        
        val results = queryFactory
            .selectFrom(gallery)
            .where(builder)
            .orderBy(gallery.createdAt.desc())
            .offset(pageable.offset)
            .limit(pageable.pageSize.toLong())
            .fetch()
        
        val total = queryFactory
            .select(gallery.count())
            .from(gallery)
            .where(builder)
            .fetchOne() ?: 0L
        
        return PageImpl(results, pageable, total)
    }
    
    override fun findPopularGalleries(
        teamSubdomain: String,
        limit: Int
    ): List<Gallery> {
        return queryFactory
            .selectFrom(gallery)
            .where(
                gallery.teamSubdomain.eq(teamSubdomain)
                    .and(gallery.isActive.isTrue)
            )
            .orderBy(gallery.viewCount.desc(), gallery.createdAt.desc())
            .limit(limit.toLong())
            .fetch()
    }
    
    override fun findHighlightGalleries(
        teamSubdomain: String,
        playType: PlayType?,
        pageable: Pageable
    ): Page<Gallery> {
        val builder = BooleanBuilder()
        builder.and(gallery.teamSubdomain.eq(teamSubdomain))
        builder.and(gallery.isActive.isTrue)
        builder.and(gallery.category.eq(GalleryCategory.HIGHLIGHT))
        
        // 하이라이트 메타데이터 필터 - 서브쿼리 사용
        playType?.let {
            val galleryIdsWithPlayType = queryFactory
                .select(highlightMetadata.galleryId)
                .from(highlightMetadata)
                .where(highlightMetadata.playType.eq(it))
                .fetch()
            
            if (galleryIdsWithPlayType.isNotEmpty()) {
                builder.and(gallery.id.`in`(galleryIdsWithPlayType))
            } else {
                builder.and(gallery.id.eq(-1L))
            }
        }
        
        val results = queryFactory
            .selectFrom(gallery)
            .where(builder)
            .orderBy(gallery.createdAt.desc())
            .offset(pageable.offset)
            .limit(pageable.pageSize.toLong())
            .fetch()
        
        val total = queryFactory
            .select(gallery.count())
            .from(gallery)
            .where(builder)
            .fetchOne() ?: 0L
        
        return PageImpl(results, pageable, total)
    }
    
    override fun getGalleryStatistics(teamSubdomain: String): GalleryStatistics {
        // 전체 갤러리 수
        val totalCount = queryFactory
            .select(gallery.count())
            .from(gallery)
            .where(
                gallery.teamSubdomain.eq(teamSubdomain)
                    .and(gallery.isActive.isTrue)
            )
            .fetchOne() ?: 0L
        
        // 카테고리별 갤러리 수
        val categoryStats = queryFactory
            .select(gallery.category, gallery.count())
            .from(gallery)
            .where(
                gallery.teamSubdomain.eq(teamSubdomain)
                    .and(gallery.isActive.isTrue)
            )
            .groupBy(gallery.category)
            .fetch()
            .associate { it.get(gallery.category)!! to (it.get(gallery.count()) ?: 0L) }
        
        // 총 조회수
        val totalViewCount = queryFactory
            .select(gallery.viewCount.sum())
            .from(gallery)
            .where(
                gallery.teamSubdomain.eq(teamSubdomain)
                    .and(gallery.isActive.isTrue)
            )
            .fetchOne() ?: 0
        
        // 총 미디어 파일 수 - 서브쿼리 사용
        val activeGalleryIds = queryFactory
            .select(gallery.id)
            .from(gallery)
            .where(
                gallery.teamSubdomain.eq(teamSubdomain)
                    .and(gallery.isActive.isTrue)
            )
            .fetch()
        
        val totalMediaCount = if (activeGalleryIds.isNotEmpty()) {
            queryFactory
                .select(galleryMedia.count())
                .from(galleryMedia)
                .where(galleryMedia.galleryId.`in`(activeGalleryIds))
                .fetchOne() ?: 0L
        } else {
            0L
        }
        
        // 이번 달 생성된 갤러리 수
        val thisMonthStart = LocalDate.now().withDayOfMonth(1).atStartOfDay()
        val thisMonthCount = queryFactory
            .select(gallery.count())
            .from(gallery)
            .where(
                gallery.teamSubdomain.eq(teamSubdomain)
                    .and(gallery.isActive.isTrue)
                    .and(gallery.createdAt.goe(thisMonthStart))
            )
            .fetchOne() ?: 0L
        
        return GalleryStatistics(
            totalGalleryCount = totalCount,
            categoryStats = categoryStats,
            totalViewCount = totalViewCount,
            totalMediaCount = totalMediaCount,
            thisMonthGalleryCount = thisMonthCount
        )
    }
}

/**
 * 갤러리 통계 데이터 클래스
 */
data class GalleryStatistics(
    val totalGalleryCount: Long,
    val categoryStats: Map<GalleryCategory, Long>,
    val totalViewCount: Int,
    val totalMediaCount: Long,
    val thisMonthGalleryCount: Long
)