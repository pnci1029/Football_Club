package io.be.controller

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
class TestController {

    @GetMapping
    fun test(
        @RequestParam(required = false) value: String?
    ): String {

        return value ?: "test"
    }
}
