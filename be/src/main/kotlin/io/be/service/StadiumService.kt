package io.be.service

import io.be.dto.CreateStadiumRequest
import io.be.dto.StadiumDto
import io.be.dto.UpdateStadiumRequest
import io.be.entity.Stadium
import io.be.repository.StadiumRepository
import io.be.repository.TeamRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class StadiumService(
    private val stadiumRepository: StadiumRepository,
    private val teamRepository: TeamRepository
) {
    
    fun findAllStadiums(pageable: Pageable): Page<StadiumDto> {
        return stadiumRepository.findAll(pageable).map { StadiumDto.from(it) }
    }
    
    fun findStadiumById(id: Long): StadiumDto? {
        return stadiumRepository.findById(id).orElse(null)?.let { StadiumDto.from(it) }
    }
    
    fun findStadiumsByTeam(teamId: Long, pageable: Pageable): Page<StadiumDto> {
        return stadiumRepository.findByTeamId(teamId, pageable).map { StadiumDto.from(it) }
    }
    
    fun searchStadiumsByName(name: String): List<StadiumDto> {
        return stadiumRepository.findByNameContaining(name).map { StadiumDto.from(it) }
    }
    
    fun searchStadiumsByAddress(address: String): List<StadiumDto> {
        return stadiumRepository.findByAddressContaining(address).map { StadiumDto.from(it) }
    }
    
    @Transactional
    fun createStadium(request: CreateStadiumRequest): StadiumDto {
        val team = teamRepository.findById(request.teamId!!).orElseThrow {
            IllegalArgumentException("Team not found with id: ${request.teamId}")
        }
        
        val stadium = Stadium(
            name = request.name,
            address = request.address,
            latitude = request.latitude,
            longitude = request.longitude,
            team = team,
            facilities = request.facilities,
            hourlyRate = request.hourlyRate,
            availableHours = request.availableHours,
            contactNumber = request.contactNumber,
            imageUrls = request.imageUrls
        )
        
        val savedStadium = stadiumRepository.save(stadium)
        return StadiumDto.from(savedStadium)
    }
    
    @Transactional
    fun updateStadium(id: Long, request: UpdateStadiumRequest): StadiumDto {
        val stadium = stadiumRepository.findById(id).orElseThrow { 
            io.be.exception.StadiumNotFoundException(id) 
        }
        
        val updatedStadium = stadium.copy(
            name = request.name ?: stadium.name,
            address = request.address ?: stadium.address,
            latitude = request.latitude ?: stadium.latitude,
            longitude = request.longitude ?: stadium.longitude,
            facilities = request.facilities ?: stadium.facilities,
            hourlyRate = request.hourlyRate ?: stadium.hourlyRate,
            availableHours = request.availableHours ?: stadium.availableHours,
            contactNumber = request.contactNumber ?: stadium.contactNumber,
            imageUrls = request.imageUrls ?: stadium.imageUrls
        )
        
        val savedStadium = stadiumRepository.save(updatedStadium)
        return StadiumDto.from(savedStadium)
    }
    
    @Transactional
    fun deleteStadium(id: Long) {
        if (!stadiumRepository.existsById(id)) {
            throw io.be.exception.StadiumNotFoundException(id)
        }
        stadiumRepository.deleteById(id)
    }
    
    fun findStadiumsByTeam(teamId: Long): List<StadiumDto> {
        return stadiumRepository.findByTeamId(teamId).map { StadiumDto.from(it) }
    }
}