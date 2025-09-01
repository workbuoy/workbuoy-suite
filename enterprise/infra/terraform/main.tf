terraform {
  required_version = ">= 1.5.0"
  required_providers { docker = { source = "kreuzwerker/docker", version = "~> 3.0" } }
}

provider "docker" {}

resource "docker_network" "wb" { name = "wb_net" }

resource "docker_image" "api" { name = "ghcr.io/example/wb-api:latest" }

resource "docker_container" "api" {
  name  = "wb-api"
  image = docker_image.api.name
  ports { internal = 8080, external = 8080 }
  networks_advanced { name = docker_network.wb.name }
  env = ["NODE_ENV=production"]
}