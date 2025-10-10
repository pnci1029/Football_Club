package io.be.community.domain

import com.querydsl.core.types.dsl.BooleanExpression
import com.querydsl.jpa.impl.JPAQueryFactory
import io.be.community.domain.CommunityPost
import io.be.community.domain.QCommunityPost.communityPost
import io.be.community.domain.QCommunityComment.communityComment
import io.be.shared.base.BaseQueryRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Repository

@Repository
class CommunityPostRepositoryImpl(
    queryFactory: JPAQueryFactory
) : BaseQueryRepository(queryFactory), CommunityPostRepositoryCustom {

    override fun findByTeamIdAndKeyword(teamId: Long, keyword: String, pageable: Pageable): Page<CommunityPost> {
        val contentQuery = queryFactory
            .selectFrom(communityPost)
            .where(
                teamIdEq(teamId),
                isActiveTrue(),
                titleOrContentContains(keyword)
            )
            .orderBy(communityPost.createdAt.desc())

        val countQuery = queryFactory
            .select(communityPost.count())
            .from(communityPost)
            .where(
                teamIdEq(teamId),
                isActiveTrue(),
                titleOrContentContains(keyword)
            )

        return fetchPageResponse(pageable, contentQuery, countQuery)
    }

    override fun findByTeamIdAndCategoryAndKeyword(teamId: Long, category: CommunityCategory, keyword: String, pageable: Pageable): Page<CommunityPost> {
        val contentQuery = queryFactory
            .selectFrom(communityPost)
            .where(
                teamIdEq(teamId),
                categoryEq(category),
                isActiveTrue(),
                titleOrContentContains(keyword)
            )
            .orderBy(communityPost.createdAt.desc())

        val countQuery = queryFactory
            .select(communityPost.count())
            .from(communityPost)
            .where(
                teamIdEq(teamId),
                categoryEq(category),
                isActiveTrue(),
                titleOrContentContains(keyword)
            )

        return fetchPageResponse(pageable, contentQuery, countQuery)
    }

    override fun findByKeyword(keyword: String, pageable: Pageable): Page<CommunityPost> {
        val contentQuery = queryFactory
            .selectFrom(communityPost)
            .where(
                isActiveTrue(),
                titleOrContentContains(keyword)
            )
            .orderBy(communityPost.createdAt.desc())

        val countQuery = queryFactory
            .select(communityPost.count())
            .from(communityPost)
            .where(
                isActiveTrue(),
                titleOrContentContains(keyword)
            )

        return fetchPageResponse(pageable, contentQuery, countQuery)
    }

    override fun incrementViewCount(id: Long) {
        queryFactory
            .update(communityPost)
            .set(communityPost.viewCount, communityPost.viewCount.add(1))
            .where(communityPost.id.eq(id))
            .execute()
    }

    override fun incrementViewCountBy(id: Long, increment: Long) {
        queryFactory
            .update(communityPost)
            .set(communityPost.viewCount, communityPost.viewCount.add(increment))
            .where(communityPost.id.eq(id))
            .execute()
    }

    override fun countCommentsByPostId(postId: Long): Long {
        return queryFactory
            .select(communityComment.count())
            .from(communityComment)
            .where(
                communityComment.post.id.eq(postId),
                communityComment.isActive.isTrue
            )
            .fetchOne() ?: 0L
    }

    // === Private 조건 메서드들 ===
    private fun teamIdEq(teamId: Long?): BooleanExpression? {
        return teamId?.let { communityPost.teamId.eq(it) }
    }

    private fun isActiveTrue(): BooleanExpression {
        return communityPost.isActive.isTrue
    }

    private fun categoryEq(category: CommunityCategory?): BooleanExpression? {
        return category?.let { communityPost.category.eq(it) }
    }

    private fun titleOrContentContains(keyword: String?): BooleanExpression? {
        return keyword?.let {
            communityPost.title.contains(it)
                .or(communityPost.content.contains(it))
        }
    }
}