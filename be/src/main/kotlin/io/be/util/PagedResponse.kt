package io.be.util

import org.springframework.data.domain.Page

data class PagedResponse<T>(
    val content: List<T>,
    val page: PageInfo,
    val metadata: PageMetadata? = null
) {
    companion object {
        fun <T> of(page: Page<T>, metadata: PageMetadata? = null): PagedResponse<T> {
            return PagedResponse(
                content = page.content,
                page = PageInfo(
                    number = page.number,
                    size = page.size,
                    totalElements = page.totalElements,
                    totalPages = page.totalPages,
                    first = page.isFirst,
                    last = page.isLast,
                    empty = page.isEmpty,
                    numberOfElements = page.numberOfElements
                ),
                metadata = metadata
            )
        }
        
        fun <T> of(content: List<T>, page: Int, size: Int, totalElements: Long, metadata: PageMetadata? = null): PagedResponse<T> {
            val totalPages = if (size == 0) 1 else ((totalElements + size - 1) / size).toInt()
            
            return PagedResponse(
                content = content,
                page = PageInfo(
                    number = page,
                    size = size,
                    totalElements = totalElements,
                    totalPages = totalPages,
                    first = page == 0,
                    last = page >= totalPages - 1,
                    empty = content.isEmpty(),
                    numberOfElements = content.size
                ),
                metadata = metadata
            )
        }
    }
}

data class PageInfo(
    val number: Int,                    // 현재 페이지 번호 (0부터 시작)
    val size: Int,                      // 페이지 크기
    val totalElements: Long,            // 전체 요소 개수
    val totalPages: Int,                // 전체 페이지 수
    val first: Boolean,                 // 첫 페이지 여부
    val last: Boolean,                  // 마지막 페이지 여부
    val empty: Boolean,                 // 빈 페이지 여부
    val numberOfElements: Int           // 현재 페이지 요소 개수
)

data class PageMetadata(
    val filters: Map<String, Any>? = null,      // 적용된 필터 정보
    val sort: List<String>? = null,             // 정렬 정보
    val searchQuery: String? = null,            // 검색 쿼리
    val teamId: Long? = null,                   // 팀 ID (멀티테넌트)
    val additionalInfo: Map<String, Any>? = null // 추가 메타데이터
)