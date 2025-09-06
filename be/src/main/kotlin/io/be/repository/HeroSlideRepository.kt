package io.be.repository

import io.be.entity.HeroSlide
import io.be.entity.Team
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface HeroSlideRepository : JpaRepository<HeroSlide, Long> {
    
    fun findByTeamOrderBySortOrderAsc(team: Team): List<HeroSlide>
    
    fun findByTeamAndIsActiveTrueOrderBySortOrderAsc(team: Team): List<HeroSlide>
    
    fun countByTeam(team: Team): Long
    
    @Modifying
    @Query("UPDATE HeroSlide h SET h.sortOrder = :sortOrder WHERE h.id = :id")
    fun updateSortOrder(@Param("id") id: Long, @Param("sortOrder") sortOrder: Int)
}