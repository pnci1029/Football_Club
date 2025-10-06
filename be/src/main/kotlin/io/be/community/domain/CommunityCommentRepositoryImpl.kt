package io.be.community.domain

import com.querydsl.jpa.impl.JPAQueryFactory
import io.be.community.domain.CommunityComment
import io.be.community.domain.QCommunityComment.communityComment
import io.be.community.domain.QCommunityPost.communityPost
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