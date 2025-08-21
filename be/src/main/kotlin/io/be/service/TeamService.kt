package io.be.service

import io.be.dto.CreateTeamRequest
import io.be.dto.TeamDto
import io.be.dto.UpdateTeamRequest
import io.be.entity.Team
import io.be.repository.TeamRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class TeamService(
    private val teamRepository: TeamRepository
) {
    
    fun findAllTeams(pageable: Pageable): Page<TeamDto> {
        return teamRepository.findAll(pageable).map { TeamDto.from(it) }
    }
    
    fun findTeamById(id: Long): TeamDto? {
        return teamRepository.findById(id).orElse(null)?.let { TeamDto.from(it) }
    }
    
    fun findTeamByCode(code: String): TeamDto? {
        return teamRepository.findByCode(code)?.let { TeamDto.from(it) }
    }
    
    @Transactional
    fun createTeam(request: CreateTeamRequest): TeamDto {
        if (teamRepository.findByCode(request.code) != null) {
            throw io.be.exception.TeamCodeAlreadyExistsException(request.code)
        }
        
        val team = Team(
            code = request.code,
            name = request.name,
            description = request.description,
            logoUrl = request.logoUrl
        )
        
        val savedTeam = teamRepository.save(team)
        return TeamDto.from(savedTeam)
    }
    
    @Transactional
    fun updateTeam(id: Long, request: UpdateTeamRequest): TeamDto {
        val team = teamRepository.findById(id).orElseThrow { 
            io.be.exception.TeamNotFoundException(id) 
        }
        
        val updatedTeam = team.copy(
            name = request.name ?: team.name,
            description = request.description ?: team.description,
            logoUrl = request.logoUrl ?: team.logoUrl
        )
        
        val savedTeam = teamRepository.save(updatedTeam)
        return TeamDto.from(savedTeam)
    }
    
    @Transactional
    fun deleteTeam(id: Long) {
        if (!teamRepository.existsById(id)) {
            throw io.be.exception.TeamNotFoundException(id)
        }
        teamRepository.deleteById(id)
    }
}