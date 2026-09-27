<script setup lang="ts">
/**
 * 季/集选择器（合并原组件中逐字重复的三处）
 *
 * 三处使用点：need_selection 步骤2、need_season_episode、emby_conflict 步骤2。
 * 结构完全相同（季 tabs + 集网格 + 无季时的手动输入回退），
 * 唯一差异是手动输入 NInputNumber 是否带 size="small"
 * （need_selection 用 small，另两处不用），经 inputSize prop 区分。
 *
 * 纯展示：selectedSeason / selectedEpisode 由父组件持有。
 */
import {
  NIcon,
  NImage,
  NInputNumber,
  NScrollbar,
  NTabPane,
  NTabs,
} from 'naive-ui'
import { CheckmarkOutline } from '@vicons/ionicons5'
import type { TMDBEpisode, TMDBSeason } from '@/shared/types/common'
import EmptyState from '@/shared/components/base/EmptyState.vue'
import { useTmdbDisplay } from '@/modules/history/hooks/useTmdbDisplay'

withDefaults(defineProps<{
  seasons: TMDBSeason[]
  episodes: TMDBEpisode[]
  selectedSeason: number
  selectedEpisode: number | null
  /** 手动输入框尺寸（need_selection 传 'small'，另两处不传） */
  inputSize?: 'small' | 'medium' | 'large'
}>(), {
  inputSize: undefined,
})

const emit = defineEmits<{
  'update:selectedSeason': [value: number]
  /** 网格点选（传整个 episode 对象） */
  'select-episode': [ep: TMDBEpisode]
  /** 手动输入集号（仅数字，与原实现 v-model:value 语义一致） */
  'update:selectedEpisode': [value: number | null]
}>()

const { getImageUrl } = useTmdbDisplay()
</script>

<template>
  <div>
    <div v-if="seasons.length" class="season-picker">
      <NTabs
        :value="selectedSeason"
        type="segment"
        size="small"
        @update:value="emit('update:selectedSeason', $event as number)"
      >
        <NTabPane
          v-for="season in seasons"
          :key="season.season_number"
          :name="season.season_number"
          :tab="`第 ${season.season_number} 季`"
        />
      </NTabs>

      <NScrollbar style="max-height: 40vh; margin-top: 16px">
        <div v-if="episodes.length" class="episodes-grid">
          <div
            v-for="ep in episodes"
            :key="ep.episode_number"
            class="episode-card"
            :class="{ selected: selectedEpisode === ep.episode_number }"
            @click="emit('select-episode', ep)"
          >
            <div class="still-wrapper">
              <NImage
                v-if="ep.still_path"
                :src="getImageUrl(ep.still_path)!"
                object-fit="cover"
                preview-disabled
                lazy
                class="still"
              />
              <div v-else class="no-still">E{{ ep.episode_number }}</div>
              <div class="ep-badge">E{{ String(ep.episode_number).padStart(2, '0') }}</div>
              <div v-if="selectedEpisode === ep.episode_number" class="selected-overlay">
                <NIcon :component="CheckmarkOutline" :size="24" />
              </div>
            </div>
            <div class="ep-info">
              <div class="ep-title">{{ ep.name || `第 ${ep.episode_number} 集` }}</div>
              <div v-if="ep.air_date" class="ep-date">{{ ep.air_date }}</div>
            </div>
          </div>
        </div>
        <EmptyState v-else title="该季暂无可用集数" />
      </NScrollbar>
    </div>

    <!-- 无季信息时回退到手动输入 -->
    <div v-else class="manual-input">
      <div class="input-group">
        <label>季</label>
        <NInputNumber
          :value="selectedSeason"
          :min="1"
          :max="99"
          :size="inputSize"
          @update:value="emit('update:selectedSeason', $event as number)"
        />
      </div>
      <div class="input-group">
        <label>集</label>
        <NInputNumber
          :value="selectedEpisode"
          :min="1"
          :max="9999"
          :size="inputSize"
          @update:value="emit('update:selectedEpisode', $event)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>

.season-picker {
  margin-top: 8px;
}

.episodes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
  padding: 4px;
}

.episode-card {
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--bg-subtle);
}

.episode-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgb(var(--black-rgb) / 12%);
}

.episode-card.selected {
  box-shadow: inset 0 0 0 2px var(--brand-500);
}

.still-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  /* 剧照占位底：用最深的表面色，亮暗两种模式下都能与卡片区分 */
  background: var(--text-1);
}

.still {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.no-still {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  color: var(--text-2);
  background: var(--bg-hover);
}

.ep-badge {
  position: absolute;
  top: 6px;
  left: 6px;
  padding: 3px 8px;
  background: rgb(var(--black-rgb) / 75%);
  color: white;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
}

.selected-overlay {
  position: absolute;
  inset: 0;
  background: rgb(var(--brand-rgb) / 50%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.ep-info {
  padding: 10px 12px;
}

.ep-title {
  font-size: 13px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-1);
}

.ep-date {
  font-size: 11px;
  color: var(--text-3);
  margin-top: 2px;
}

.manual-input {
  display: flex;
  gap: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-1);
}

.input-group {
  flex: 1;
}
</style>
