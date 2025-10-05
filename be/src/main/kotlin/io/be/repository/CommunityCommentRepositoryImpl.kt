package io.be.repository

import com.querydsl.jpa.impl.JPAQueryFactory
import io.be.entity.CommunityComment
import io.be.entity.QCommunityComment.communityComment
import io.be.entity.QCommunityPost.communityPost
import org.springframework.stereotype.Repository

@Repository
class CommunityCommentRepositoryImpl(
    private val queryFactory: JPAQueryFactory
) : CommunityCommentRepositoryCustom {

    override fun findByIdAndTeamId(commentId: Long, teamId: Long): CommunityComment? {
        return queryFactory
            .selectFrom(communityComment)
            .innerJoin(communityComment.post, communityPost)
            .where(
                communityComment.id.eq(commentId),
                communityPost.teamId.eq(teamId),
                communityComment.isActive.isTrue
            )
            .fetchOne()
    }
}