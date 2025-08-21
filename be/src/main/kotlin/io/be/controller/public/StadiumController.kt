package io.be.controller.public

import io.be.dto.StadiumDto
import io.be.service.StadiumService
import io.be.util.ApiResponse
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v1/stadiums")
@CrossOrigin(origins = ["*"])
class StadiumController(
    private val stadiumService: StadiumService
) {
    
    @GetMapping
    fun getAllStadiums(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int
    ): ResponseEntity<ApiResponse<Page<StadiumDto>>> {
        val stadiums = stadiumService.findAllStadiums(PageRequest.of(page, size))
        return ResponseEntity.ok(ApiResponse.success(stadiums))
    }
    
    @GetMapping("/{id}")
    fun getStadium(@PathVariable id: Long): ResponseEntity<ApiResponse<StadiumDto>> {
        val stadium = stadiumService.findStadiumById(id)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(ApiResponse.success(stadium))
    }
    
    @GetMapping("/search")
    fun searchStadiums(
        @RequestParam(required = false) name: String?,
        @RequestParam(required = false) address: String?
    ): ResponseEntity<ApiResponse<List<StadiumDto>>> {
        val stadiums = when {
            !name.isNullOrBlank() -> stadiumService.searchStadiumsByName(name)
            !address.isNullOrBlank() -> stadiumService.searchStadiumsByAddress(address)
            else -> emptyList()
        }
        
        return ResponseEntity.ok(ApiResponse.success(stadiums))
    }
}