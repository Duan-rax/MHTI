<script setup lang="ts">
/**
 * 冲突弹窗正文（6 条分支）
 *
 * 覆盖：无 conflict_type 错误提示 / retry 模式三步流程 / need_selection 两步 /
 * need_season_episode / file_conflict / emby_conflict 两步 / needManualInput 三步。
 *
 * 纯展示 + 事件上抛：全部状态与动作由父组件（ResolveConflictModal）持有，
 * 动作经 actions 对象传入（函数不经 ref 解包，传对象安全）。
 * 分支判定顺序与缩进结构与原实现逐字一致。
 */
import { computed } from 'vue'
import { NButton, NIcon, NSpace, NTag } from 'naive-ui'
import { SearchOutline } from '@vicons/ionicons5'
import type { TMDBEpisode, TMDBSearchResult, TMDBSeason } from '@/shared/types/common'
import type { HistoryRecordDetail } from '@/modules/history/types'
import ConflictStepHeader from '@/modules/history/components/ConflictStepHeader.vue'
import ConflictOptionGroup, { type ConflictOption } from '@/modules/history/components/ConflictOptionGroup.vue'
import EmbyConflictPanel from '@/modules/history/components/EmbyConflictPanel.vue'
import ManualMatchFlow from '@/modules/history/components/ManualMatchFlow.vue'
import RetryConfirmPanel from '@/modules/history/components/RetryConfirmPanel.vue'
import SearchResultList from '@/modules/history/components/SearchResultList.vue'
import SeasonEpisodePicker from '@/modules/history/components/SeasonEpisodePicker.vue'
import type { RetryMatch } from '@/modules/history/utils'

const props = defineProps<{
  record: HistoryRecordDetail
  isRetryMode: boolean
  /** 重试模式下已确定的匹配（有值则直接确认，不再走搜索流程） */
  retryMatch: RetryMatch | null
  needManualInput: boolean
  // need_selection / emby / 手动匹配的流程状态
  step: number
  embyStep: number
  manualStep: number
  loadingSeasons: boolean
  searchResults: TMDBSearchResult[]
  parsedSeasonEpisode: { season: number; episode: number } | null
  embyConflictInfo: { message: string | null; season: number | null; episode: number | null } | null
  seasons: TMDBSeason[]
  currentSeasonEpisodes: TMDBEpisode[]
  loadedSeasons: TMDBSeason[]
  selectedSeason: number
  selectedEpisode: number | null
  manualSearchQuery: string
  manualSearching: boolean
  manualHasSearched: boolean
  manualSearchResults: TMDBSearchResult[]
  fileAction: 'overwrite' | 'skip' | 'rename'
  embyAction: 'skip' | 'force' | 'change'
  /** 流程动作（父组件持有，函数传入） */
  actions: {
    selectSeries: (result: TMDBSearchResult) => void | Promise<void>
    selectEpisode: (ep: TMDBEpisode) => void
    backToStep1: () => void
    searchOtherMatch: () => void
    enterEmbySeasonSelect: () => void
    backToEmbyStep1: () => void
    manualSearch: () => void
    manualSelectSeries: (result: TMDBSearchResult) => void
    manualSelectSeason: (season: TMDBSeason) => void
    manualSelectEpisode: (ep: TMDBEpisode) => void
    openSearch: () => void
  }
}>()

const emit = defineEmits<{
  'update:fileAction': [value: 'overwrite' | 'skip' | 'rename']
  'update:embyAction': [value: 'skip' | 'force' | 'change']
  'update:selectedSeason': [value: number]
  'update:selectedEpisode': [value: number | null]
  'update:manualSearchQuery': [value: string]
}>()

// 文件冲突选项（原模板内联，迁移为常量）
const fileConflictOptions: ConflictOption[] = [
  { value: 'skip', label: '跳过', desc: '保留现有文件，不做任何操作' },
  { value: 'overwrite', label: '覆盖', desc: '替换现有文件' },
  { value: 'rename', label: '重命名', desc: '添加序号保存为新文件' },
]

// 手动匹配有效季 / 当前季集
const manualValidSeasons = computed(() =>
  props.loadedSeasons.filter((s) => s.season_number > 0 && (s.episode_count ?? 0) > 0),
)
const manualCurrentEpisodes = computed(() => {
  const season = props.loadedSeasons.find((s) => s.season_number === props.selectedSeason)
  return season?.episodes || []
})
</script>

<template>
  <div class="modal-body">
    <!-- 文件信息 -->
    <div class="file-hint">
      <span class="label">当前文件</span>
      <span class="name">{{ record.folder_path.split(/[/\\]/).pop() }}</span>
    </div>

    <!-- 无冲突类型时显示错误 -->
    <div v-if="!record.conflict_type && !isRetryMode" class="error-tip">
      该记录缺少冲突类型信息，无法处理。请删除此记录后重新刮削。
    </div>

    <!-- 重试模式 - 已确定匹配则直接确认，否则复用手动匹配三步流程 -->
    <template v-if="isRetryMode">
      <RetryConfirmPanel
        v-if="retryMatch"
        :match="retryMatch"
        :title="record.title"
        :file-name="record.folder_path.split(/[/\\]/).pop() || record.folder_path"
        @search="actions.searchOtherMatch"
      />
      <ManualMatchFlow
        v-else
        :step="manualStep"
        :search-query="manualSearchQuery"
        :searching="manualSearching"
        :has-searched="manualHasSearched"
        :results="manualSearchResults"
        :valid-seasons="manualValidSeasons"
        :current-episodes="manualCurrentEpisodes"
        empty-description="未找到匹配结果"
        @update:search-query="emit('update:manualSearchQuery', $event)"
        @search="actions.manualSearch"
        @select-series="actions.manualSelectSeries"
        @select-season="actions.manualSelectSeason"
        @select-episode="actions.manualSelectEpisode"
      />
    </template>

    <!-- 多结果选择 - 两步流程 -->
    <template v-if="record.conflict_type === 'need_selection'">
      <!-- 步骤1: 选择剧集 -->
      <template v-if="step === 1">
        <NSpace justify="space-between" align="center" style="margin-bottom: 12px">
          <div class="section-hint">
            找到 <strong>{{ searchResults.length }}</strong> 个匹配结果，请点击选择
            <NTag v-if="parsedSeasonEpisode" size="small" type="success" round>
              已解析 S{{ String(parsedSeasonEpisode.season).padStart(2, '0') }}E{{ String(parsedSeasonEpisode.episode).padStart(2, '0') }}
            </NTag>
          </div>
          <NButton quaternary circle @click="actions.openSearch" aria-label="搜索剧集">
            <template #icon><NIcon :component="SearchOutline" /></template>
          </NButton>
        </NSpace>

        <SearchResultList
          :loading="loadingSeasons"
          :results="searchResults"
          @select="actions.selectSeries"
        />
      </template>

      <!-- 步骤2: 选择季/集（预选值为解析结果，可改） -->
      <template v-else-if="step === 2">
        <ConflictStepHeader back-label="返回选择剧集" @back="actions.backToStep1" @search="actions.openSearch" />

        <SeasonEpisodePicker
        :seasons="seasons"
        :episodes="currentSeasonEpisodes"
        :selected-season="selectedSeason"
        :selected-episode="selectedEpisode"
        input-size="small"
        @select-episode="actions.selectEpisode"
        @update:selected-season="emit('update:selectedSeason', $event)"
        @update:selected-episode="emit('update:selectedEpisode', $event)"
        />
      </template>
    </template>

    <!-- 季集选择 -->
    <template v-else-if="record.conflict_type === 'need_season_episode'">
      <ConflictStepHeader title="请选择季和集" @search="actions.openSearch" />

      <SeasonEpisodePicker
      :seasons="seasons"
      :episodes="currentSeasonEpisodes"
      :selected-season="selectedSeason"
      :selected-episode="selectedEpisode"
      @select-episode="actions.selectEpisode"
      @update:selected-season="emit('update:selectedSeason', $event)"
      @update:selected-episode="emit('update:selectedEpisode', $event)"
      />
    </template>

    <!-- 文件冲突 -->
    <template v-else-if="record.conflict_type === 'file_conflict'">
      <div class="conflict-options">
        <div class="option-title">选择处理方式</div>
        <ConflictOptionGroup
          :model-value="fileAction"
          :options="fileConflictOptions"
          @update:model-value="emit('update:fileAction', $event as 'overwrite' | 'skip' | 'rename')"
        />
      </div>
    </template>

    <!-- Emby 冲突 -->
    <template v-else-if="record.conflict_type === 'emby_conflict'">
      <!-- 步骤1: 选择处理方式 -->
      <template v-if="embyStep === 1">
        <EmbyConflictPanel
          :model-value="embyAction"
          :message="embyConflictInfo?.message ?? null"
          :season="embyConflictInfo?.season ?? null"
          :episode="embyConflictInfo?.episode ?? null"
          :loading="loadingSeasons"
          @update:model-value="emit('update:embyAction', $event as 'skip' | 'force' | 'change')"
          @change="actions.enterEmbySeasonSelect"
        />
      </template>

      <!-- 步骤2: 选择季/集 -->
      <template v-else-if="embyStep === 2">
        <ConflictStepHeader back-label="返回" @back="actions.backToEmbyStep1" @search="actions.openSearch" />

        <SeasonEpisodePicker
        :seasons="seasons"
        :episodes="currentSeasonEpisodes"
        :selected-season="selectedSeason"
        :selected-episode="selectedEpisode"
        @select-episode="actions.selectEpisode"
        @update:selected-season="emit('update:selectedSeason', $event)"
        @update:selected-episode="emit('update:selectedEpisode', $event)"
        />
      </template>
    </template>

    <!-- 手动匹配 - 三步流程 -->
    <template v-else-if="needManualInput">
      <ManualMatchFlow
        :step="manualStep"
        :search-query="manualSearchQuery"
        :searching="manualSearching"
        :has-searched="manualHasSearched"
        :results="manualSearchResults"
        :valid-seasons="manualValidSeasons"
        :current-episodes="manualCurrentEpisodes"
        @update:search-query="emit('update:manualSearchQuery', $event)"
        @search="actions.manualSearch"
        @select-series="actions.manualSelectSeries"
        @select-season="actions.manualSelectSeason"
        @select-episode="actions.manualSelectEpisode"
      />
    </template>
  </div>
</template>

<style scoped>
.modal-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 文件提示 */
.file-hint {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 16px;
  background: rgb(var(--brand-rgb) / 8%);
  border-radius: 10px;
}

.file-hint .label {
  font-size: 12px;
  color: var(--text-3);
}

.file-hint .name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-1);
  word-break: break-all;
}

.error-tip {
  padding: 12px 16px;
  background: rgb(var(--danger-rgb) / 10%);
  border-radius: 10px;
  color: var(--danger-500);
  font-size: 14px;
}

.section-hint {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: var(--text-2);
}
</style>