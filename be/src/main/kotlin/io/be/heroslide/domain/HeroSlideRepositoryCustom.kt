package io.be.heroslide.domain

interface HeroSlideRepositoryCustom {
    
    // 정렬 순서 업데이트
    fun updateSortOrder(id: Long, sortOrder: Int)
}