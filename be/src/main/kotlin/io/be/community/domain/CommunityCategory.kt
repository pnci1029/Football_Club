package io.be.community.domain

enum class CommunityCategory(val displayName: String, val isActive: Boolean = true) {
    FREE_BOARD("자유게시판"),
    EARLY_FOOTBALL_INQUIRY("조기축구 가입 문의"),
    TEAM_PHOTOS("축구단 기념사진"),
    
    // 기존 데이터 호환성을 위해 유지 (UI에서는 숨김)
    @Deprecated("Use FREE_BOARD instead")
    MATCH_RECRUITMENT("경기 모집", false),
    @Deprecated("Use FREE_BOARD instead") 
    EQUIPMENT_TRADE("용품 거래", false),
    @Deprecated("Use FREE_BOARD instead")
    ANNOUNCEMENT("공지사항", false);

    companion object {
        fun fromDisplayName(displayName: String): CommunityCategory? {
            return values().find { it.displayName == displayName }
        }
        
        fun getActiveCategories(): List<CommunityCategory> {
            return values().filter { it.isActive }
        }
    }
}