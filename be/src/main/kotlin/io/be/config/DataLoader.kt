package io.be.config

import io.be.entity.Team
import io.be.entity.Player
import io.be.repository.TeamRepository
import io.be.repository.PlayerRepository
import org.springframework.boot.CommandLineRunner
import org.springframework.stereotype.Component

@Component
class DataLoader(
    private val teamRepository: TeamRepository,
    private val playerRepository: PlayerRepository
) : CommandLineRunner {

    override fun run(vararg args: String?) {
        // 기존 데이터가 있으면 스킵
        if (teamRepository.count() > 0) {
            return
        }

        // 샘플 팀 데이터 생성
        val teams = listOf(
            Team(
                code = "kim",
                name = "김철수 FC",
                description = "서울 지역 축구 동호회",
                logoUrl = null
            ),
            Team(
                code = "park",
                name = "박영희 유나이티드",
                description = "부산 지역 축구 동호회",
                logoUrl = null
            )
        )

        val savedTeams = teamRepository.saveAll(teams)
        
        // 샘플 선수 데이터 생성
        val kimTeam = savedTeams.find { it.code == "kim" }!!
        val parkTeam = savedTeams.find { it.code == "park" }!!
        
        val players = listOf(
            // 김철수 FC 선수들
            Player(name = "김민수", position = "GK", backNumber = 1, team = kimTeam),
            Player(name = "이동훈", position = "DF", backNumber = 2, team = kimTeam),
            Player(name = "박지성", position = "MF", backNumber = 10, team = kimTeam),
            Player(name = "손흥민", position = "FW", backNumber = 11, team = kimTeam),
            
            // 박영희 유나이티드 선수들
            Player(name = "조현우", position = "GK", backNumber = 1, team = parkTeam),
            Player(name = "김진수", position = "DF", backNumber = 3, team = parkTeam),
            Player(name = "이강인", position = "MF", backNumber = 7, team = parkTeam),
            Player(name = "황희찬", position = "FW", backNumber = 9, team = parkTeam)
        )
        
        playerRepository.saveAll(players)
        
        println("샘플 팀 데이터가 생성되었습니다:")
        savedTeams.forEach { team ->
            println("- ${team.name} (${team.code})")
        }
    }
}