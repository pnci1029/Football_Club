package io.be.player.domain

import com.querydsl.core.BooleanBuilder
import com.querydsl.core.types.Projections
import com.querydsl.jpa.impl.JPAQueryFactory
import io.be.player.domain.QPlayer.player
import io.be.player.dto.PlayerStatistics
import io.be.shared.base.BaseQueryRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.Pageable
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

    override fun findPlayersWithFilters(
        teamId: Long, 
        position: String?, 
        search: String?, 
        isActive: Boolean?,
        pageable: Pageable
    ): Page<Player> {
        val condition = BooleanBuilder()
            .and(player.team.id.eq(teamId))
            .and(player.isDeleted.isFalse)

        position?.let { condition.and(player.position.eq(it)) }
        search?.let { 
            condition.and(
                player.name.containsIgnoreCase(it)
                    .or(player.position.containsIgnoreCase(it))
                    .or(player.backNumber.stringValue().contains(it))
            )
        }
        isActive?.let { condition.and(player.isActive.eq(it)) }

        val query = queryFactory
            .selectFrom(player)
            .where(condition)
            .orderBy(player.backNumber.asc())
            .offset(pageable.offset)
            .limit(pageable.pageSize.toLong())

        val players = query.fetch()
        val total = queryFactory
            .select(player.count())
            .from(player)
            .where(condition)
            .fetchOne() ?: 0L

        return PageImpl(players, pageable, total)
    }

    override fun getPlayerStatsByTeam(teamId: Long): PlayerStatistics {
        val totalPlayers = queryFactory
            .select(player.count())
            .from(player)
            .where(player.team.id.eq(teamId).and(player.isDeleted.isFalse))
            .fetchOne() ?: 0L

        val activePlayers = queryFactory
            .select(player.count())
            .from(player)
            .where(
                player.team.id.eq(teamId)
                    .and(player.isDeleted.isFalse)
                    .and(player.isActive.isTrue)
            )
            .fetchOne() ?: 0L

        val positionStats = queryFactory
            .select(
                player.position,
                player.count()
            )
            .from(player)
            .where(player.team.id.eq(teamId).and(player.isDeleted.isFalse))
            .groupBy(player.position)
            .fetch()
            .associate { it.get(0, String::class.java)!! to it.get(1, Long::class.java)!! }

        return PlayerStatistics(
            totalPlayers = totalPlayers,
            activePlayers = activePlayers,
            inactivePlayers = totalPlayers - activePlayers,
            positionStats = positionStats
        )
    }

    override fun existsByTeamIdAndBackNumberAndNotId(
        teamId: Long, 
        backNumber: Int, 
        excludeId: Long?
    ): Boolean {
        val condition = BooleanBuilder()
            .and(player.team.id.eq(teamId))
            .and(player.backNumber.eq(backNumber))
            .and(player.isDeleted.isFalse)

        excludeId?.let { condition.and(player.id.ne(it)) }

        return queryFactory
            .selectOne()
            .from(player)
            .where(condition)
            .fetchFirst() != null
    }
}