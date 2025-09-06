package io.be.service

import io.be.dto.*
import io.be.entity.HeroSlide
import io.be.repository.HeroSlideRepository
import io.be.repository.TeamRepository
import io.be.security.TenantContext
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class HeroSlideService(
    private val heroSlideRepository: HeroSlideRepository,
    private val teamRepository: TeamRepository
) {
    
    fun getActiveSlides(): List<HeroSlideDto> {
        val teamCode = TenantContext.getCurrentTeamCode()
            ?: throw IllegalStateException("Team context not found")
            
        val team = teamRepository.findByCodeAndIsDeletedFalse(teamCode)
            ?: throw IllegalArgumentException("Team not found: $teamCode")
            
        return heroSlideRepository.findByTeamAndIsActiveTrueOrderBySortOrderAsc(team)
            .map { HeroSlideDto.from(it) }
    }
    
    fun getActiveSlidesForTeam(teamId: Long): List<HeroSlideDto> {
        val team = teamRepository.findById(teamId).orElseThrow {
            IllegalArgumentException("Team not found: $teamId")
        }
        
        return heroSlideRepository.findByTeamAndIsActiveTrueOrderBySortOrderAsc(team)
            .map { HeroSlideDto.from(it) }
    }
    
    fun getAllSlides(): List<HeroSlideDto> {
        val teamCode = TenantContext.getCurrentTeamCode()
            ?: throw IllegalStateException("Team context not found")
            
        val team = teamRepository.findByCodeAndIsDeletedFalse(teamCode)
            ?: throw IllegalArgumentException("Team not found: $teamCode")
            
        return heroSlideRepository.findByTeamOrderBySortOrderAsc(team)
            .map { HeroSlideDto.from(it) }
    }
    
    fun getAllSlidesForTeam(teamId: Long): List<HeroSlideDto> {
        val team = teamRepository.findById(teamId).orElseThrow {
            IllegalArgumentException("Team not found: $teamId")
        }
        
        return heroSlideRepository.findByTeamOrderBySortOrderAsc(team)
            .map { HeroSlideDto.from(it) }
    }
    
    fun getSlideById(id: Long): HeroSlideDto? {
        val slide = heroSlideRepository.findById(id).orElse(null) ?: return null
        
        val teamCode = TenantContext.getCurrentTeamCode()
            ?: throw IllegalStateException("Team context not found")
            
        // 현재 팀의 슬라이드인지 확인
        if (slide.team.code != teamCode) {
            return null
        }
        
        return HeroSlideDto.from(slide)
    }
    
    @Transactional
    fun createSlide(request: CreateHeroSlideRequest): HeroSlideDto {
        val teamCode = TenantContext.getCurrentTeamCode()
            ?: throw IllegalStateException("Team context not found")
            
        val team = teamRepository.findByCodeAndIsDeletedFalse(teamCode)
            ?: throw IllegalArgumentException("Team not found: $teamCode")
        
        // 최대 5개 제한
        val currentCount = heroSlideRepository.countByTeam(team)
        if (currentCount >= 5) {
            throw IllegalArgumentException("Maximum 5 hero slides allowed per team")
        }
        
        val heroSlide = HeroSlide(
            team = team,
            title = request.title,
            subtitle = request.subtitle,
            backgroundImage = request.backgroundImage,
            gradientColor = request.gradientColor,
            isActive = request.isActive,
            sortOrder = request.sortOrder
        )
        
        val savedSlide = heroSlideRepository.save(heroSlide)
        return HeroSlideDto.from(savedSlide)
    }
    
    @Transactional
    fun createSlideForTeam(teamId: Long, request: CreateHeroSlideRequest): HeroSlideDto {
        val team = teamRepository.findById(teamId).orElseThrow {
            IllegalArgumentException("Team not found: $teamId")
        }
        
        // 최대 5개 제한
        val currentCount = heroSlideRepository.countByTeam(team)
        if (currentCount >= 5) {
            throw IllegalArgumentException("Maximum 5 hero slides allowed per team")
        }
        
        val heroSlide = HeroSlide(
            team = team,
            title = request.title,
            subtitle = request.subtitle,
            backgroundImage = request.backgroundImage,
            gradientColor = request.gradientColor,
            isActive = request.isActive,
            sortOrder = request.sortOrder
        )
        
        val savedSlide = heroSlideRepository.save(heroSlide)
        return HeroSlideDto.from(savedSlide)
    }
    
    @Transactional
    fun updateSlide(id: Long, request: UpdateHeroSlideRequest): HeroSlideDto {
        val existingSlide = heroSlideRepository.findById(id).orElseThrow {
            IllegalArgumentException("Hero slide not found: $id")
        }
        
        val teamCode = TenantContext.getCurrentTeamCode()
            ?: throw IllegalStateException("Team context not found")
            
        // 현재 팀의 슬라이드인지 확인
        if (existingSlide.team.code != teamCode) {
            throw IllegalArgumentException("Hero slide not found: $id")
        }
        
        val updatedSlide = existingSlide.copy(
            title = request.title ?: existingSlide.title,
            subtitle = request.subtitle ?: existingSlide.subtitle,
            backgroundImage = request.backgroundImage ?: existingSlide.backgroundImage,
            gradientColor = request.gradientColor ?: existingSlide.gradientColor,
            isActive = request.isActive ?: existingSlide.isActive,
            sortOrder = request.sortOrder ?: existingSlide.sortOrder
        )
        
        val savedSlide = heroSlideRepository.save(updatedSlide)
        return HeroSlideDto.from(savedSlide)
    }
    
    @Transactional
    fun deleteSlide(id: Long) {
        val existingSlide = heroSlideRepository.findById(id).orElseThrow {
            IllegalArgumentException("Hero slide not found: $id")
        }
        
        val teamCode = TenantContext.getCurrentTeamCode()
            ?: throw IllegalStateException("Team context not found")
            
        // 현재 팀의 슬라이드인지 확인
        if (existingSlide.team.code != teamCode) {
            throw IllegalArgumentException("Hero slide not found: $id")
        }
        
        // 최소 1개 제한
        val currentCount = heroSlideRepository.countByTeam(existingSlide.team)
        if (currentCount <= 1) {
            throw IllegalArgumentException("At least 1 hero slide is required")
        }
        
        heroSlideRepository.delete(existingSlide)
    }
    
    @Transactional
    fun updateSortOrder(request: UpdateSortOrderRequest) {
        val teamCode = TenantContext.getCurrentTeamCode()
            ?: throw IllegalStateException("Team context not found")
            
        request.slides.forEach { slideOrder ->
            val slide = heroSlideRepository.findById(slideOrder.id).orElse(null)
            if (slide != null && slide.team.code == teamCode) {
                heroSlideRepository.updateSortOrder(slideOrder.id, slideOrder.sortOrder)
            }
        }
    }
}