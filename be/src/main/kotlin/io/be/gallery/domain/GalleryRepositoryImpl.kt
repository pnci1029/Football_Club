package io.be.gallery.domain

import com.querydsl.core.BooleanBuilder
import com.querydsl.jpa.impl.JPAQueryFactory
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.time.LocalDateTime

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
        
        var query = queryFactory
            .selectFrom(gallery)
            .where(builder)
        
        // 태그 필터가 있는 경우
        if (!tags.isNullOrEmpty()) {
            query = query
                .join(gallery.tags, galleryTag)
                .where(galleryTag.tagName.`in`(tags))
                .groupBy(gallery.id)
                .having(gallery.id.count().eq(tags.size.toLong())) // AND 조건
        }
        
        // 정렬
        query = query.orderBy(gallery.createdAt.desc())
        
        val results = query
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
        val results = queryFactory
            .selectFrom(gallery)
            .join(gallery.tags, galleryTag)
            .where(
                gallery.teamSubdomain.eq(teamSubdomain)
                    .and(gallery.isActive.isTrue)
                    .and(galleryTag.tagName.`in`(tags))
            )
            .distinct()
            .orderBy(gallery.createdAt.desc())
            .offset(pageable.offset)
            .limit(pageable.pageSize.toLong())
            .fetch()
        
        val total = queryFactory
            .select(gallery.countDistinct())
            .from(gallery)
            .join(gallery.tags, galleryTag)
            .where(
                gallery.teamSubdomain.eq(teamSubdomain)
                    .and(gallery.isActive.isTrue)
                    .and(galleryTag.tagName.`in`(tags))
            )
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
        
        playType?.let {
            builder.and(highlightMetadata.playType.eq(it))
        }
        
        val results = queryFactory
            .selectFrom(gallery)
            .leftJoin(gallery.mediaFiles, galleryMedia).on(galleryMedia.gallery.eq(gallery))
            .leftJoin(highlightMetadata).on(highlightMetadata.gallery.eq(gallery))
            .where(builder)
            .orderBy(highlightMetadata.highlightRating.desc(), gallery.createdAt.desc())
            .offset(pageable.offset)
            .limit(pageable.pageSize.toLong())
            .fetch()
        
        val total = queryFactory
            .select(gallery.count())
            .from(gallery)
            .leftJoin(highlightMetadata).on(highlightMetadata.gallery.eq(gallery))
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
        
        // 총 미디어 파일 수
        val totalMediaCount = queryFactory
            .select(galleryMedia.count())
            .from(galleryMedia)
            .join(galleryMedia.gallery, gallery)
            .where(
                gallery.teamSubdomain.eq(teamSubdomain)
                    .and(gallery.isActive.isTrue)
            )
            .fetchOne() ?: 0L
        
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