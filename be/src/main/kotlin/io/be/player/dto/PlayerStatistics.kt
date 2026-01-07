package io.be.player.dto

data class PlayerStatistics(
    val totalPlayers: Long,
    val activePlayers: Long,
    val inactivePlayers: Long,
    val positionStats: Map<String, Long>
)