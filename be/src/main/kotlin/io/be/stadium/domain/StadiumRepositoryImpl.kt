package io.be.stadium.domain

import com.querydsl.core.types.dsl.BooleanExpression
import com.querydsl.jpa.impl.JPAQueryFactory
import io.be.stadium.domain.Stadium
// import io.be.stadium.domain.QStadium.stadium
import io.be.shared.base.BaseQueryRepository
import org.springframework.stereotype.Repository

@Repository
class StadiumRepositoryImpl(
    queryFactory: JPAQueryFactory
) : /* BaseQueryRepository(queryFactory), */ StadiumRepositoryCustom {

    override fun findByHourlyRateBetween(minRate: Int, maxRate: Int): List<Stadium> {
        // TODO: QueryDSL Q클래스 생성 후 활성화
        TODO("QueryDSL Q클래스 생성 후 구현")
        /*
        return queryFactory
            .selectFrom(stadium)
            .where(stadium.hourlyRate.between(minRate, maxRate))
            .fetch()
        */
    }

    override fun findStadiumsWithFilters(
        name: String?,
        address: String?,
        minRate: Int?,
        maxRate: Int?
    ): List<Stadium> {
        // TODO: QueryDSL Q클래스 생성 후 활성화
        TODO("QueryDSL Q클래스 생성 후 구현")
        /*
        return queryFactory
            .selectFrom(stadium)
            .where(
                nameContains(name),
                addressContains(address),
                hourlyRateGoe(minRate),
                hourlyRateLoe(maxRate)
            )
            .fetch()
        */
    }

    // === Private 조건 메서드들 ===
    // TODO: QueryDSL Q클래스 생성 후 활성화
    /*
    private fun nameContains(name: String?): BooleanExpression? {
        return name?.let { stadium.name.contains(it) }
    }

    private fun addressContains(address: String?): BooleanExpression? {
        return address?.let { stadium.address.contains(it) }
    }

    private fun hourlyRateGoe(minRate: Int?): BooleanExpression? {
        return minRate?.let { stadium.hourlyRate.goe(it) }
    }

    private fun hourlyRateLoe(maxRate: Int?): BooleanExpression? {
        return maxRate?.let { stadium.hourlyRate.loe(it) }
    }
    */
}