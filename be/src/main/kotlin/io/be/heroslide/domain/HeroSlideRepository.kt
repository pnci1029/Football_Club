package io.be.heroslide.domain

import io.be.heroslide.domain.HeroSlide
import io.be.team.domain.Team
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface HeroSlideRepository : JpaRepository<HeroSlide, Long>, HeroSlideRepositoryCustom {
    
    fun findByTeamOrderBySortOrderAsc(team: Team): List<HeroSlide>
    
    fun findByTeamAndIsActiveTrueOrderBySortOrderAsc(team: Team): List<HeroSlide>
    
    fun countByTeam(team: Team): Long
    
}