package io.be.heroslide.dto

import io.be.heroslide.domain.HeroSlide
import io.be.heroslide.domain.GradientColor
import java.time.LocalDateTime

data class HeroSlideDto(
    val id: Long,
    val title: String,
    val subtitle: String,
    val backgroundImage: String?,
    val gradientColor: GradientColor,
    val isActive: Boolean,
    val sortOrder: Int,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
) {
    companion object {
        fun from(heroSlide: HeroSlide): HeroSlideDto {
            return HeroSlideDto(
                id = heroSlide.id,
                title = heroSlide.title,
                subtitle = heroSlide.subtitle,
                backgroundImage = heroSlide.backgroundImage,
                gradientColor = heroSlide.gradientColor,
                isActive = heroSlide.isActive,
                sortOrder = heroSlide.sortOrder,
                createdAt = heroSlide.createdAt,
                updatedAt = heroSlide.updatedAt
            )
        }
    }
}

data class CreateHeroSlideRequest(
    val title: String,
    val subtitle: String,
    val backgroundImage: String?,
    val gradientColor: GradientColor,
    val isActive: Boolean,
    val sortOrder: Int
)

data class UpdateHeroSlideRequest(
    val title: String?,
    val subtitle: String?,
    val backgroundImage: String?,
    val gradientColor: GradientColor?,
    val isActive: Boolean?,
    val sortOrder: Int?
)

data class UpdateSortOrderRequest(
    val slides: List<SlideOrderItem>
)

data class SlideOrderItem(
    val id: Long,
    val sortOrder: Int
)