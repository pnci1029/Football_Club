package io.be.notice.domain

import com.querydsl.jpa.impl.JPAQueryFactory
import io.be.notice.domain.NoticeComment
// import io.be.notice.domain.QNoticeComment.noticeComment
// import io.be.notice.domain.QNotice.notice
import io.be.shared.base.BaseQueryRepository
import org.springframework.stereotype.Repository

@Repository
class NoticeCommentRepositoryImpl(
    queryFactory: JPAQueryFactory
) : /* BaseQueryRepository(queryFactory), */ NoticeCommentRepositoryCustom {

    override fun findByIdAndTeamId(commentId: Long, teamId: Long): NoticeComment? {
        // TODO: QueryDSL Q클래스 생성 후 활성화
        TODO("QueryDSL Q클래스 생성 후 구현")
        /*
        return queryFactory
            .selectFrom(noticeComment)
            .join(noticeComment.notice, notice)
            .where(
                noticeComment.id.eq(commentId),
                notice.teamId.eq(teamId),
                noticeComment.isActive.isTrue
            )
            .fetchOne()
        */
    }
}