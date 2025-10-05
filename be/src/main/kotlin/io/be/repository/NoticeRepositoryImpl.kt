package io.be.repository

import com.querydsl.core.types.dsl.BooleanExpression
import com.querydsl.jpa.impl.JPAQueryFactory
import io.be.entity.Notice
import io.be.entity.QNotice.notice
import io.be.entity.QNoticeComment.noticeComment
import io.be.repository.base.BaseQueryRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Repository

@Repository
class NoticeRepositoryImpl(
    queryFactory: JPAQueryFactory
) : BaseQueryRepository(queryFactory), NoticeRepositoryCustom {

    override fun findByTeamIdAndKeyword(teamId: Long, keyword: String, pageable: Pageable): Page<Notice> {
        val contentQuery = queryFactory
            .selectFrom(notice)
            .where(
                teamIdEq(teamId),
                isActiveTrue(),
                titleOrContentContains(keyword)
            )
            .orderBy(notice.createdAt.desc())

        val countQuery = queryFactory
            .select(notice.count())
            .from(notice)
            .where(
                teamIdEq(teamId),
                isActiveTrue(),
                titleOrContentContains(keyword)
            )

        return fetchPageResponse(pageable, contentQuery, countQuery)
    }

    override fun findByKeywordAndGlobalVisible(keyword: String, pageable: Pageable): Page<Notice> {
        val contentQuery = queryFactory
            .selectFrom(notice)
            .where(
                isActiveTrue(),
                isGlobalVisibleTrue(),
                titleOrContentContains(keyword)
            )
            .orderBy(notice.createdAt.desc())

        val countQuery = queryFactory
            .select(notice.count())
            .from(notice)
            .where(
                isActiveTrue(),
                isGlobalVisibleTrue(),
                titleOrContentContains(keyword)
            )

        return fetchPageResponse(pageable, contentQuery, countQuery)
    }

    override fun incrementViewCount(id: Long) {
        queryFactory
            .update(notice)
            .set(notice.viewCount, notice.viewCount.add(1))
            .where(notice.id.eq(id))
            .execute()
    }

    override fun incrementViewCountBy(id: Long, increment: Long) {
        queryFactory
            .update(notice)
            .set(notice.viewCount, notice.viewCount.add(increment))
            .where(notice.id.eq(id))
            .execute()
    }

    override fun countCommentsByNoticeId(noticeId: Long): Long {
        return queryFactory
            .select(noticeComment.count())
            .from(noticeComment)
            .where(
                noticeComment.notice.id.eq(noticeId),
                noticeComment.isActive.isTrue
            )
            .fetchOne() ?: 0L
    }

    // === Private 조건 메서드들 ===
    
    private fun teamIdEq(teamId: Long?): BooleanExpression? {
        return teamId?.let { notice.teamId.eq(it) }
    }

    private fun isActiveTrue(): BooleanExpression {
        return notice.isActive.isTrue
    }

    private fun isGlobalVisibleTrue(): BooleanExpression {
        return notice.isGlobalVisible.isTrue
    }

    private fun titleOrContentContains(keyword: String?): BooleanExpression? {
        return keyword?.let {
            notice.title.contains(it)
                .or(notice.content.contains(it))
        }
    }
}