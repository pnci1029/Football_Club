package io.be.player.domain

import com.querydsl.jpa.impl.JPAQueryFactory
import io.be.player.domain.QPlayer.player
import io.be.shared.base.BaseQueryRepository
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Repository
class PlayerRepositoryImpl(
    queryFactory: JPAQueryFactory
) : BaseQueryRepository(queryFactory), PlayerRepositoryCustom {

    @Transactional
    override fun softDeleteById(id: Long, deletedAt: LocalDateTime) {
        queryFactory
            .update(player)
            .set(player.isDeleted, true)
            .set(player.deletedAt, deletedAt)
            .where(player.id.eq(id))
            .execute()
    }
}