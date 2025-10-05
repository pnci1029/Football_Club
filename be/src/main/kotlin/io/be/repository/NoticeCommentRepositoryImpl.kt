package io.be.repository

import com.querydsl.jpa.impl.JPAQueryFactory
import io.be.entity.NoticeComment
import io.be.entity.QNoticeComment.noticeComment
import io.be.entity.QNotice.notice
import io.be.repository.base.BaseQueryRepository
import org.springframework.stereotype.Repository

@Repository
class NoticeCommentRepositoryImpl(
    queryFactory: JPAQueryFactory
) : BaseQueryRepository(queryFactory), NoticeCommentRepositoryCustom {

    override fun findByIdAndTeamId(commentId: Long, teamId: Long): NoticeComment? {
        return queryFactory
            .selectFrom(noticeComment)
            .join(noticeComment.notice, notice)
            .where(
                noticeComment.id.eq(commentId),
                notice.teamId.eq(teamId),
                noticeComment.isActive.isTrue
            )
            .fetchOne()
    }
}