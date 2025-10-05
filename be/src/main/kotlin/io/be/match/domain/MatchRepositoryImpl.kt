package io.be.match.domain

import com.querydsl.jpa.impl.JPAQueryFactory
import io.be.match.domain.Match
import io.be.match.domain.MatchStatus
// import io.be.match.domain.QMatch.match
import io.be.shared.base.BaseQueryRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Repository
import java.time.LocalDateTime

@Repository
class MatchRepositoryImpl(
    queryFactory: JPAQueryFactory
) : /* BaseQueryRepository(queryFactory), */ MatchRepositoryCustom {

    override fun findByTeamId(teamId: Long, pageable: Pageable): Page<Match> {
        // TODO: QueryDSL Q클래스 생성 후 활성화
        TODO("QueryDSL Q클래스 생성 후 구현")
        /*
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
        */
    }

    override fun findUpcomingMatchesByTeam(teamId: Long, fromDate: LocalDateTime): List<Match> {
        // TODO: QueryDSL Q클래스 생성 후 활성화
        TODO("QueryDSL Q클래스 생성 후 구현")
        /*
        return queryFactory
            .selectFrom(match)
            .where(
                match.homeTeam.id.eq(teamId)
                    .or(match.awayTeam.id.eq(teamId)),
                match.matchDate.goe(fromDate)
            )
            .orderBy(match.matchDate.asc())
            .fetch()
        */
    }

    override fun findByTeamIdAndStatus(teamId: Long, status: MatchStatus, pageable: Pageable): Page<Match> {
        // TODO: QueryDSL Q클래스 생성 후 활성화
        TODO("QueryDSL Q클래스 생성 후 구현")
        /*
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
        */
    }

    override fun findByStadiumId(stadiumId: Long, pageable: Pageable): Page<Match> {
        // TODO: QueryDSL Q클래스 생성 후 활성화
        TODO("QueryDSL Q클래스 생성 후 구현")
        /*
        val contentQuery = queryFactory
            .selectFrom(match)
            .where(match.stadium.id.eq(stadiumId))
            .orderBy(match.matchDate.desc())

        val countQuery = queryFactory
            .select(match.count())
            .from(match)
            .where(match.stadium.id.eq(stadiumId))

        return fetchPageResponse(pageable, contentQuery, countQuery)
        */
    }

    override fun findByMatchDateBetween(startDate: LocalDateTime, endDate: LocalDateTime): List<Match> {
        // TODO: QueryDSL Q클래스 생성 후 활성화
        TODO("QueryDSL Q클래스 생성 후 구현")
        /*
        return queryFactory
            .selectFrom(match)
            .where(match.matchDate.between(startDate, endDate))
            .orderBy(match.matchDate.asc())
            .fetch()
        */
    }
}