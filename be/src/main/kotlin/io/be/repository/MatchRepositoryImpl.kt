package io.be.repository

import com.querydsl.jpa.impl.JPAQueryFactory
import io.be.entity.Match
import io.be.entity.MatchStatus
import io.be.entity.QMatch.match
import io.be.repository.base.BaseQueryRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Repository
import java.time.LocalDateTime

@Repository
class MatchRepositoryImpl(
    queryFactory: JPAQueryFactory
) : BaseQueryRepository(queryFactory), MatchRepositoryCustom {

    override fun findByTeamId(teamId: Long, pageable: Pageable): Page<Match> {
        val contentQuery = queryFactory
            .selectFrom(match)
            .where(
                match.homeTeam.id.eq(teamId)
                    .or(match.awayTeam.id.eq(teamId))
            )
            .orderBy(match.matchDate.desc())

        val countQuery = queryFactory
            .select(match.count())
            .from(match)
            .where(
                match.homeTeam.id.eq(teamId)
                    .or(match.awayTeam.id.eq(teamId))
            )

        return fetchPageResponse(pageable, contentQuery, countQuery)
    }

    override fun findUpcomingMatchesByTeam(teamId: Long, fromDate: LocalDateTime): List<Match> {
        return queryFactory
            .selectFrom(match)
            .where(
                match.homeTeam.id.eq(teamId)
                    .or(match.awayTeam.id.eq(teamId)),
                match.matchDate.goe(fromDate)
            )
            .orderBy(match.matchDate.asc())
            .fetch()
    }

    override fun findByTeamIdAndStatus(teamId: Long, status: MatchStatus, pageable: Pageable): Page<Match> {
        val contentQuery = queryFactory
            .selectFrom(match)
            .where(
                match.homeTeam.id.eq(teamId)
                    .or(match.awayTeam.id.eq(teamId)),
                match.status.eq(status)
            )
            .orderBy(match.matchDate.desc())

        val countQuery = queryFactory
            .select(match.count())
            .from(match)
            .where(
                match.homeTeam.id.eq(teamId)
                    .or(match.awayTeam.id.eq(teamId)),
                match.status.eq(status)
            )

        return fetchPageResponse(pageable, contentQuery, countQuery)
    }

    override fun findByStadiumId(stadiumId: Long, pageable: Pageable): Page<Match> {
        val contentQuery = queryFactory
            .selectFrom(match)
            .where(match.stadium.id.eq(stadiumId))
            .orderBy(match.matchDate.desc())

        val countQuery = queryFactory
            .select(match.count())
            .from(match)
            .where(match.stadium.id.eq(stadiumId))

        return fetchPageResponse(pageable, contentQuery, countQuery)
    }

    override fun findByMatchDateBetween(startDate: LocalDateTime, endDate: LocalDateTime): List<Match> {
        return queryFactory
            .selectFrom(match)
            .where(match.matchDate.between(startDate, endDate))
            .orderBy(match.matchDate.asc())
            .fetch()
    }
}