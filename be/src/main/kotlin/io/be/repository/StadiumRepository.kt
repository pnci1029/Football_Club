package io.be.repository

import io.be.entity.Stadium
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface StadiumRepository : JpaRepository<Stadium, Long> {
    fun findByNameContaining(name: String): List<Stadium>
    fun findByAddressContaining(address: String): List<Stadium>
    
    @Query("SELECT s FROM Stadium s WHERE s.hourlyRate BETWEEN :minRate AND :maxRate")
    fun findByHourlyRateBetween(@Param("minRate") minRate: Int, @Param("maxRate") maxRate: Int): List<Stadium>
    
    @Query("SELECT s FROM Stadium s WHERE " +
           "(:name IS NULL OR s.name LIKE %:name%) AND " +
           "(:address IS NULL OR s.address LIKE %:address%) AND " +
           "(:minRate IS NULL OR s.hourlyRate >= :minRate) AND " +
           "(:maxRate IS NULL OR s.hourlyRate <= :maxRate)")
    fun findStadiumsWithFilters(
        @Param("name") name: String?,
        @Param("address") address: String?,
        @Param("minRate") minRate: Int?,
        @Param("maxRate") maxRate: Int?
    ): List<Stadium>
}