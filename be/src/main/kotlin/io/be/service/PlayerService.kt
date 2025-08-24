package io.be.service

import io.be.dto.CreatePlayerRequest
import io.be.dto.PlayerDto
import io.be.dto.UpdatePlayerRequest
import io.be.entity.Player
import io.be.exception.PlayerNotFoundException
import io.be.exception.TeamNotFoundException
import io.be.repository.PlayerRepository
import io.be.repository.TeamRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
@Transactional(readOnly = true)
class PlayerService(
    private val playerRepository: PlayerRepository,
    private val teamRepository: TeamRepository
) {
    
    fun findPlayersByTeam(teamId: Long, pageable: Pageable): Page<PlayerDto> {
        return playerRepository.findByTeamIdAndIsDeletedFalse(teamId, pageable).map { PlayerDto.from(it) }
    }
    
    fun findActivePlayersByTeam(teamId: Long): List<PlayerDto> {
        return playerRepository.findByTeamIdAndIsActiveTrueAndIsDeletedFalse(teamId).map { PlayerDto.from(it) }
    }
    
    fun findPlayerById(id: Long): PlayerDto? {
        return playerRepository.findById(id).orElse(null)
            ?.takeIf { !it.isDeleted }?.let { PlayerDto.from(it) }
    }
    
    fun findPlayerByIdAndTeam(id: Long, teamId: Long): PlayerDto? {
        return playerRepository.findByIdAndTeamIdAndIsDeletedFalse(id, teamId)?.let { PlayerDto.from(it) }
    }
    
    @Transactional
    fun createPlayer(teamId: Long, request: CreatePlayerRequest): PlayerDto {
        val team = teamRepository.findById(teamId).orElseThrow { 
            TeamNotFoundException(teamId) 
        }
        
        val player = Player(
            name = request.name,
            position = request.position,
            backNumber = request.backNumber,
            profileImageUrl = request.profileImageUrl,
            team = team
        )
        
        val savedPlayer = playerRepository.save(player)
        return PlayerDto.from(savedPlayer)
    }
    
    @Transactional
    fun updatePlayer(id: Long, request: UpdatePlayerRequest): PlayerDto {
        val player = playerRepository.findById(id).orElseThrow { 
            PlayerNotFoundException(id) 
        }
        
        val updatedPlayer = player.copy(
            name = request.name ?: player.name,
            position = request.position ?: player.position,
            backNumber = request.backNumber ?: player.backNumber,
            profileImageUrl = request.profileImageUrl ?: player.profileImageUrl,
            isActive = request.isActive ?: player.isActive
        )
        
        val savedPlayer = playerRepository.save(updatedPlayer)
        return PlayerDto.from(savedPlayer)
    }
    
    @Transactional
    fun deletePlayer(id: Long) {
        val player = playerRepository.findById(id).orElseThrow {
            PlayerNotFoundException(id)
        }
        
        if (player.isDeleted) {
            throw PlayerNotFoundException(id)
        }
        
        // 소프트 딜리트 수행
        playerRepository.softDeleteById(id, LocalDateTime.now())
    }
    
    fun findPlayersByTeam(teamId: Long): List<PlayerDto> {
        return playerRepository.findByTeamIdAndIsDeletedFalse(teamId).map { PlayerDto.from(it) }
    }
}