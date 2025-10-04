package io.be.dto

import io.be.enums.ContentType

/**
 * 조회수 정보 DTO
 */
data class ViewCount(
    val type: ContentType,
    val id: Long,
    val viewCount: Long
)

/**
 * 조회수 증가 요청 DTO
 */
data class IncreaseViewCountRequest(
    val contentType: ContentType,
    val contentId: Long,
    val userIdentifier: String
)