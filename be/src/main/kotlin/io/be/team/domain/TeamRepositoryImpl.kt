package io.be.team.domain

import com.querydsl.jpa.impl.JPAQueryFactory
// import io.be.team.domain.QTeam.team
import io.be.shared.base.BaseQueryRepository
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Repository
class TeamRepositoryImpl(
    queryFactory: JPAQueryFactory
) : /* BaseQueryRepository(queryFactory), */ TeamRepositoryCustom {

    @Transactional
    override fun softDeleteById(id: Long, deletedAt: LocalDateTime) {
        // TODO: QueryDSL Q클래스 생성 후 활성화
        TODO("QueryDSL Q클래스 생성 후 구현")
        /*
        queryFactory
            .update(team)
            .set(team.isDeleted, true)
            .set(team.deletedAt, deletedAt)
            .where(team.id.eq(id))
            .execute()
        */
    }
}