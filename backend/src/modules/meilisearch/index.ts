import MeilisearchService from "./service"
import { Module } from "@medusajs/framework/utils"

export const MEILISEARCH_MODULE = "meilisearch"

export default Module(MEILISEARCH_MODULE, {
  service: MeilisearchService,
})
