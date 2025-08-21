package io.be.dto

import io.be.entity.Stadium

data class StadiumDto(
    val id: Long,
    val name: String,
    val address: String,
    val latitude: Double,
    val longitude: Double,
    val facilities: String?,
    val hourlyRate: Int?,
    val availableHours: String?,
    val contactNumber: String?,
    val imageUrls: String?
) {
    companion object {
        fun from(stadium: Stadium): StadiumDto {
            return StadiumDto(
                id = stadium.id,
                name = stadium.name,
                address = stadium.address,
                latitude = stadium.latitude,
                longitude = stadium.longitude,
                facilities = stadium.facilities,
                hourlyRate = stadium.hourlyRate,
                availableHours = stadium.availableHours,
                contactNumber = stadium.contactNumber,
                imageUrls = stadium.imageUrls
            )
        }
    }
}

data class CreateStadiumRequest(
    val name: String,
    val address: String,
    val latitude: Double,
    val longitude: Double,
    val facilities: String?,
    val hourlyRate: Int?,
    val availableHours: String?,
    val contactNumber: String?,
    val imageUrls: String?
)

data class UpdateStadiumRequest(
    val name: String?,
    val address: String?,
    val latitude: Double?,
    val longitude: Double?,
    val facilities: String?,
    val hourlyRate: Int?,
    val availableHours: String?,
    val contactNumber: String?,
    val imageUrls: String?
)