package io.be.exception

class PlayerNotFoundException(id: Long) : RuntimeException("Player not found with id: $id")
class TeamNotFoundException(id: Long) : RuntimeException("Team not found with id: $id")
class TeamCodeAlreadyExistsException(code: String) : RuntimeException("Team with code '$code' already exists")
class StadiumNotFoundException(id: Long) : RuntimeException("Stadium not found with id: $id")
class MatchNotFoundException(id: Long) : RuntimeException("Match not found with id: $id")
class InvalidSubdomainException(host: String) : RuntimeException("Invalid subdomain: $host")