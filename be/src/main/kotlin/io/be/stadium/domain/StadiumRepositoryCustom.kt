package io.be.stadium.domain

import io.be.stadium.domain.Stadium

interface StadiumRepositoryCustom {
    
    // 시간당 요금 범위로 경기장 검색
    fun findByHourlyRateBetween(minRate: Int, maxRate: Int): List<Stadium>
    
    // 복합 조건으로 경기장 검색
    fun findStadiumsWithFilters(
        name: String?,
        address: String?,
        minRate: Int?,
        maxRate: Int?
    ): List<Stadium>
}