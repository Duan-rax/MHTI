import { computed, type Ref } from 'vue'
import type { TMDBSeason } from '@/shared/types/common'
import type { ConflictType, HistoryRecordDetail } from '@/modules/history/types'

/**
 * conflict_data 解析（ResolveConflictModal）
 *
 * 把散落的 6 处 `record.conflict_data` 类型收窄集中到一处：
 * searchResults / parsedSeasonEpisode / seriesInfo / embyConflictInfo /
 * seasons / currentSeasonEpisodes。逻辑与原实现逐字等价（含 as 断言）。
 */
export function useConflictRecordData(
  record: Ref<HistoryRecordDetail | null>,
  selectedSeason: Ref<number>,
  loadedSeasons: Ref<TMDBSeason[]>,
) {
  // 搜索结果列表
  const searchResults = computed(() => {
    if (!record.value?.conflict_data?.search_results) return []
    return record.value.conflict_data.search_results as import('@/shared/types/common').TMDBSearchResult[]
  })

  // 解析出的季/集信息（第 0 季视为未解析）
  // 第 0 季在库内不可达：季列表 / 季集选择器都只收 season_number > 0，
  // 历史记录里可能存着解析出的 0（旧解析器把 OVA 当特别篇），不能当可用值用
  const parsedSeasonEpisode = computed(() => {
    if (!record.value?.conflict_data) return null
    const season = record.value.conflict_data.parsed_season as number | null
    const episode = record.value.conflict_data.parsed_episode as number | null
    if (season != null && season > 0 && episode != null) {
      return { season, episode }
    }
    return null
  })

  // series_info
  const seriesInfo = computed(() => {
    if (!record.value?.conflict_data?.series_info) return null
    return record.value.conflict_data.series_info as {
      name?: string
      poster_path?: string
      seasons?: TMDBSeason[]
    }
  })

  // Emby 冲突信息
  const embyConflictInfo = computed(() => {
    if (!record.value?.conflict_data) return null
    return {
      message: record.value.conflict_data.emby_message as string | null,
      season: record.value.conflict_data.season as number | null,
      episode: record.value.conflict_data.episode as number | null,
    }
  })

  // 季列表（过滤掉第0季）- 优先使用加载的数据
  const seasons = computed(() => {
    const list = loadedSeasons.value.length ? loadedSeasons.value : (seriesInfo.value?.seasons || [])
    return list.filter((s) => s.season_number > 0)
  })

  // 当前选中季的集列表
  const currentSeasonEpisodes = computed(() => {
    if (!seasons.value.length) return []
    const season = seasons.value.find((s) => s.season_number === selectedSeason.value)
    return season?.episodes || []
  })

  return {
    searchResults,
    parsedSeasonEpisode,
    seriesInfo,
    embyConflictInfo,
    seasons,
    currentSeasonEpisodes,
  }
}

/** 冲突类型 → 标题（modalTitle 的兜底表） */
export const CONFLICT_TITLES: Record<ConflictType, string> = {
  need_selection: '选择匹配剧集',
  need_season_episode: '选择季/集',
  file_conflict: '文件冲突',
  no_match: '手动匹配',
  search_failed: '手动匹配',
  api_failed: '手动匹配',
  emby_conflict: 'Emby 冲突',
}