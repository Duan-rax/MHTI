import { computed, ref, type Ref } from 'vue'
import type { TMDBSeason } from '@/shared/types/common'
import type { HistoryRecordDetail } from '@/modules/history/types'
import { getRetryMatch } from '@/modules/history/utils'

/**
 * 重试模式的两个问题：弹窗打开时填什么、能不能不搜索直接重试
 *
 * - 沿用上次匹配：记录已确定 TMDB ID/季/集（本轮起后的记录存列，旧记录回退 conflict_data）
 *   就不再走「搜索剧集」流程；「改用其他匹配」把它关掉，回到搜索。
 * - 旧记录的 conflict_data 仍要预填（用户可能只是想改季/集后重试），
 *   所以沿用失败时按老逻辑回填，而不是留空。
 */
export function useRetryMatch(options: {
  record: Ref<HistoryRecordDetail | null>
  isRetryMode: Ref<boolean>
  selectedTmdbId: Ref<number | null>
  selectedSeason: Ref<number>
  selectedEpisode: Ref<number | null>
  seasons: Ref<TMDBSeason[]>
  resetManualSearch: () => void
}) {
  const useManualMatch = ref(false)

  const retryMatch = computed(() =>
    options.isRetryMode.value && !useManualMatch.value && options.record.value
      ? getRetryMatch(options.record.value)
      : null,
  )

  /** 每次打开弹窗调用：恢复「可沿用」状态 */
  const reset = () => {
    useManualMatch.value = false
  }

  /** 改用其他匹配：清掉预填，避免旧季/集跟着搜索流程走 */
  const switchToManualSearch = () => {
    useManualMatch.value = true
    options.selectedTmdbId.value = null
    options.selectedEpisode.value = null
    options.resetManualSearch()
  }

  /** 打开弹窗时预填：返回 true 表示可在确认页直接重试 */
  const prefillFromRecord = () => {
    const match = retryMatch.value
    if (match) {
      options.selectedTmdbId.value = match.tmdbId
      options.selectedSeason.value = match.season
      options.selectedEpisode.value = match.episode
      return true
    }

    const data = options.record.value?.conflict_data
    if (data?.tmdb_id) options.selectedTmdbId.value = data.tmdb_id as number
    if (data?.season) options.selectedSeason.value = data.season as number
    if (data?.episode) options.selectedEpisode.value = data.episode as number

    // 有季信息但没指定季：默认第一季
    const firstSeason = options.seasons.value[0]
    if (firstSeason && !data?.season) options.selectedSeason.value = firstSeason.season_number
    return false
  }

  return { retryMatch, reset, switchToManualSearch, prefillFromRecord }
}
