package io.be.repository

import io.be.entity.HeroSlide
import io.be.entity.Team
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface HeroSlideRepository : JpaRepository<HeroSlide, Long>, HeroSlideRepositoryCustom {
    
    fun findByTeamOrderBySortOrderAsc(team: Team): List<HeroSlide>
    
    fun findByTeamAndIsActiveTrueOrderBySortOrderAsc(team: Team): List<HeroSlide>
    
    fun countByTeam(team: Team): Long
    
}