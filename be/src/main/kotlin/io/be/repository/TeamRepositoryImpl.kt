package io.be.repository

import com.querydsl.jpa.impl.JPAQueryFactory
import io.be.entity.QTeam.team
import io.be.repository.base.BaseQueryRepository
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Repository
class TeamRepositoryImpl(
    queryFactory: JPAQueryFactory
) : BaseQueryRepository(queryFactory), TeamRepositoryCustom {

    @Transactional
    override fun softDeleteById(id: Long, deletedAt: LocalDateTime) {
        queryFactory
            .update(team)
            .set(team.isDeleted, true)
            .set(team.deletedAt, deletedAt)
            .where(team.id.eq(id))
            .execute()
    }
}