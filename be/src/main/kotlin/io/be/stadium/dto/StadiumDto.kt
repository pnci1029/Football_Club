package io.be.stadium.dto

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import io.be.stadium.domain.Stadium

data class StadiumDto(
    val id: Long,
    val name: String,
    val address: String,
    val latitude: Double,
    val longitude: Double,
    val teamId: Long,
    val teamName: String,
    val facilities: List<String>?,
    val hourlyRate: Int?,
    val availableHours: String?,
    val availableDays: List<String>?,
    val contactNumber: String?,
    val imageUrls: List<String>?,
    val teamContactPhone: String?,
    val teamKakaoId: String?
) {
    companion object {
        private val objectMapper = ObjectMapper()
        
        fun from(stadium: Stadium): StadiumDto {
            return StadiumDto(
                id = stadium.id,
                name = stadium.name,
                address = stadium.address,
                latitude = stadium.latitude,
                longitude = stadium.longitude,
                teamId = stadium.team.id,
                teamName = stadium.team.name,
                facilities = parseJsonToList(stadium.facilities),
                hourlyRate = stadium.hourlyRate,
                availableHours = stadium.availableHours,
                availableDays = parseJsonToList(stadium.availableDays),
                contactNumber = stadium.contactNumber,
                imageUrls = parseJsonToList(stadium.imageUrls),
                teamContactPhone = stadium.team.contactPhone,
                teamKakaoId = stadium.team.kakaoId
            )
        }
        
        private fun parseJsonToList(jsonString: String?): List<String>? {
            return if (jsonString.isNullOrBlank()) {
                null
            } else {
                try {
                    objectMapper.readValue(jsonString, object : TypeReference<List<String>>() {})
                } catch (e: Exception) {
                    null
                }
            }
        }
    }
}

data class CreateStadiumRequest(
    val name: String,
    val address: String,
    val latitude: Double,
    val longitude: Double,
    val teamId: Long? = null,
    val facilities: List<String>?,
    val hourlyRate: Int?,
    val availableHours: String?,
    val availableDays: List<String>?,
    val contactNumber: String?,
    val imageUrls: List<String>?
)

data class UpdateStadiumRequest(
    val name: String?,
    val address: String?,
    val latitude: Double?,
    val longitude: Double?,
    val facilities: List<String>?,
    val hourlyRate: Int?,
    val availableHours: String?,
    val availableDays: List<String>?,
    val contactNumber: String?,
    val imageUrls: List<String>?
)