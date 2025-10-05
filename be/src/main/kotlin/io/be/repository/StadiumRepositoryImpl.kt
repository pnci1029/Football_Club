package io.be.repository

import com.querydsl.core.types.dsl.BooleanExpression
import com.querydsl.jpa.impl.JPAQueryFactory
import io.be.entity.Stadium
import io.be.entity.QStadium.stadium
import io.be.repository.base.BaseQueryRepository
import org.springframework.stereotype.Repository

@Repository
class StadiumRepositoryImpl(
    queryFactory: JPAQueryFactory
) : BaseQueryRepository(queryFactory), StadiumRepositoryCustom {

    override fun findByHourlyRateBetween(minRate: Int, maxRate: Int): List<Stadium> {
        return queryFactory
            .selectFrom(stadium)
            .where(stadium.hourlyRate.between(minRate, maxRate))
            .fetch()
    }

    override fun findStadiumsWithFilters(
        name: String?,
        address: String?,
        minRate: Int?,
        maxRate: Int?
    ): List<Stadium> {
        return queryFactory
            .selectFrom(stadium)
            .where(
                nameContains(name),
                addressContains(address),
                hourlyRateGoe(minRate),
                hourlyRateLoe(maxRate)
            )
            .fetch()
    }

    // === Private 조건 메서드들 ===
    
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
}