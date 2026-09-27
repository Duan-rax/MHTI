/**
 * settings 域类型（Emby 集成）
 */
export type EmbyConflictType = 'no_conflict' | 'episode_exists' | 'series_exists'

export interface EmbyConfig {
  enabled: boolean
  server_url: string
  has_api_key: boolean
  user_id: string
  library_ids: string[]
  check_before_scrape: boolean
  timeout: number
}

export interface EmbyConfigRequest {
  enabled: boolean
  server_url: string
  api_key: string
  user_id: string
  library_ids: string[]
  check_before_scrape: boolean
  timeout: number
}

export interface EmbyLibrary {
  id: string
  name: string
  type: string
  item_count: number
}

export interface EmbyTestResponse {
  success: boolean
  message: string
  server_name: string | null
  server_version: string | null
  libraries: EmbyLibrary[]
  latency_ms: number | null
}

export interface EmbySeriesMatch {
  id: string
  name: string
  year: number | null
  path: string | null
  tmdb_id: number | null
}

export interface EmbyEpisodeMatch {
  id: string
  name: string
  season: number
  episode: number
  path: string | null
  series_id: string
  series_name: string
}

export interface EmbyConflictResult {
  conflict_type: EmbyConflictType
  message: string | null
  existing_series: EmbySeriesMatch | null
  existing_episode: EmbyEpisodeMatch | null
}
