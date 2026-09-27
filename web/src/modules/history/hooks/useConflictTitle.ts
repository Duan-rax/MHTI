import { computed, type Ref } from 'vue'
import type { ConflictType, HistoryRecordDetail } from '@/modules/history/types'
import { CONFLICT_TITLES } from '@/modules/history/hooks/useConflictRecordData'

/**
 * 冲突弹窗标题与「是否需手动输入」判定（ResolveConflictModal）
 *
 * 标题的分支顺序与文案逐字保留：重试模式 → 无 conflict_type → need_selection
 * → emby_conflict → needManualInput → CONFLICT_TITLES 兜底表。
 */
export function useConflictTitle(options: {
  record: Ref<HistoryRecordDetail | null>
  isRetryMode: Ref<boolean>
  /** 重试模式下是否已有可沿用的匹配（有则直接确认，标题不写「搜索剧集」） */
  retryHasMatch: Ref<boolean>
  step: Ref<number>
  embyStep: Ref<number>
  manualStep: Ref<number>
  selectedSeriesName: Ref<string>
  selectedSeason: Ref<number>
  manualSelectedSeriesName: () => string | undefined
  seriesName: () => string | undefined
}) {
  // 是否需要手动输入 TMDB ID
  const needManualInput = computed(() => {
    const types: ConflictType[] = ['no_match', 'search_failed', 'api_failed']
    return options.record.value?.conflict_type && types.includes(options.record.value.conflict_type)
  })

  // 冲突类型标题
  const modalTitle = computed(() => {
    // 重试模式的标题
    if (options.isRetryMode.value) {
      if (options.retryHasMatch.value) return '重试刮削'
      if (options.manualStep.value === 1) return '重试刮削 - 搜索剧集'
      if (options.manualStep.value === 2) return `选择季 - ${options.manualSelectedSeriesName() || ''}`
      return `选择集 - 第${options.selectedSeason.value}季`
    }

    if (!options.record.value?.conflict_type) return '处理冲突'

    // 两步流程时显示步骤
    if (options.record.value.conflict_type === 'need_selection') {
      return options.step.value === 1 ? '选择匹配剧集' : `选择季/集 - ${options.selectedSeriesName.value}`
    }

    // Emby 冲突两步流程
    if (options.record.value.conflict_type === 'emby_conflict') {
      return options.embyStep.value === 1 ? 'Emby 冲突' : `选择季/集 - ${options.seriesName() || ''}`
    }

    // 手动匹配三步流程
    if (needManualInput.value) {
      if (options.manualStep.value === 1) return '手动匹配 - 搜索剧集'
      if (options.manualStep.value === 2) return `选择季 - ${options.manualSelectedSeriesName() || ''}`
      return `选择集 - 第${options.selectedSeason.value}季`
    }

    return CONFLICT_TITLES[options.record.value.conflict_type]
  })

  return { modalTitle, needManualInput }
}
