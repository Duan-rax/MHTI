<script setup lang="ts">
/**
 * 详细信息卡（超时详情 / 剧集信息 / 标题信息 / 集简介 / 错误信息）
 *
 * 结构：每段 = 段标题（图标 + 文字）+ 定义列表（label / value 两列）。
 *
 * 视觉层次只用间距、字号、字重：段标题不再铺品牌色底块（原来每段都有一层
 * 8% 品牌底 + 品牌色标题，卡片里再套色块），「第 N 季 / 第 N 集」不再用彩色
 * 胶囊标签（设计语言禁项），错误段改用左侧强调线 + 语义色文字表达，不再叠一层
 * 8% 浅红底。尺寸与颜色全部取设计令牌。
 *
 * 超时单独成段：光看错误信息只有一句「任务超时」，看不出停在哪一步、阈值多少、
 * 要不要手动重试——这三件事实都在这里给出（与超时状态同为 warning 语义）。
 */
import { computed } from 'vue'
import { NButton, NCard, NEmpty, NIcon } from 'naive-ui'
import {
  AlertCircleOutline,
  DocumentTextOutline,
  FilmOutline,
  TimeOutline,
  TvOutline,
} from '@vicons/ionicons5'
import type { HistoryRecordDetail } from '@/modules/history/types'
import { formatDuration } from '@/modules/history/utils'

const props = defineProps<{
  record: HistoryRecordDetail
  canHandle: boolean
}>()

const emit = defineEmits<{ handle: [] }>()

const hasEpisodeInfo = computed(
  () => props.record.season_number != null || props.record.episode_number != null,
)
const hasTitleInfo = computed(() => !!(props.record.title || props.record.original_title))
const hasOverview = computed(() => !!props.record.episode_overview)

/** 超时段：超时记录的完整机制说明（节点 / 阈值 / 已耗时 / 重试入口） */
const isTimeout = computed(() => props.record.status === 'timeout')
/** 超时记录的 error_message 只是一句同义重复，不再单独成段 */
const hasError = computed(() => !!props.record.error_message && !isTimeout.value)

/** 空态判定必须覆盖每一段的真实条件 —— 原标题单独成行，漏判会导致「标题信息」与空态同时出现 */
const isEmpty = computed(
  () =>
    !isTimeout.value &&
    !hasEpisodeInfo.value &&
    !hasTitleInfo.value &&
    !hasOverview.value &&
    !hasError.value,
)
</script>

<template>
  <NCard class="detail-card">
    <template #header>
      <div class="card-header">
        <NIcon :component="DocumentTextOutline" :size="20" />
        <span>详细信息</span>
      </div>
    </template>

    <div v-if="!isEmpty" class="detail-sections">
      <!-- 超时详情 -->
      <section v-if="isTimeout" class="detail-section timeout-section">
        <h3 class="section-title is-timeout">
          <NIcon :component="TimeOutline" :size="15" />
          超时详情
          <NButton
            v-if="canHandle"
            text
            type="primary"
            size="tiny"
            class="section-action-btn"
            @click="emit('handle')"
          >
            重试刮削
          </NButton>
        </h3>
        <dl class="info-list">
          <div class="info-line">
            <dt class="info-label">超时节点</dt>
            <dd class="info-value">
              {{ record.timeout_step || '尚未进入刮削步骤（卡在准备阶段）' }}
            </dd>
          </div>
          <div class="info-line">
            <dt class="info-label">超时阈值</dt>
            <dd class="info-value">
              {{ record.timeout_seconds != null ? `${record.timeout_seconds} 秒` : '未记录' }}
            </dd>
          </div>
          <div class="info-line">
            <dt class="info-label">已耗时</dt>
            <dd class="info-value">{{ formatDuration(record.duration_seconds) }}</dd>
          </div>
        </dl>
        <p class="timeout-mechanism">
          「超时节点」是任务超时前最后执行到的步骤（可能已跑完，只是后续尾巴阶段超了）；
          整个任务受系统设置「任务超时」限制，每次执行重新读取该值，超过即中止，
          已产出的文件与元数据保留。任务不会自动重试，重跑用上方「重试刮削」。
        </p>
      </section>

      <!-- 剧集信息 -->
      <section v-if="hasEpisodeInfo" class="detail-section">
        <h3 class="section-title">
          <NIcon :component="TvOutline" :size="15" />
          剧集信息
        </h3>
        <dl class="info-list">
          <div v-if="record.season_number != null" class="info-line">
            <dt class="info-label">季</dt>
            <dd class="info-value">第 {{ record.season_number }} 季</dd>
          </div>
          <div v-if="record.episode_number != null" class="info-line">
            <dt class="info-label">集</dt>
            <dd class="info-value">第 {{ record.episode_number }} 集</dd>
          </div>
          <div v-if="record.episode_title" class="info-line">
            <dt class="info-label">集标题</dt>
            <dd class="info-value">{{ record.episode_title }}</dd>
          </div>
          <div v-if="record.episode_air_date" class="info-line">
            <dt class="info-label">播出日期</dt>
            <dd class="info-value">{{ record.episode_air_date }}</dd>
          </div>
        </dl>
      </section>

      <!-- 标题信息 -->
      <section v-if="hasTitleInfo" class="detail-section">
        <h3 class="section-title">
          <NIcon :component="FilmOutline" :size="15" />
          标题信息
        </h3>
        <dl class="info-list">
          <div v-if="record.title" class="info-line">
            <dt class="info-label">剧名</dt>
            <dd class="info-value">{{ record.title }}</dd>
          </div>
          <div v-if="record.original_title" class="info-line">
            <dt class="info-label">原标题</dt>
            <dd class="info-value is-secondary">{{ record.original_title }}</dd>
          </div>
        </dl>
      </section>

      <!-- 集简介 -->
      <section v-if="hasOverview" class="detail-section">
        <h3 class="section-title">
          <NIcon :component="DocumentTextOutline" :size="15" />
          集简介
        </h3>
        <p class="overview-text">{{ record.episode_overview }}</p>
      </section>

      <!-- 错误信息 -->
      <section v-if="hasError" class="detail-section error-section">
        <h3 class="section-title is-error">
          <NIcon :component="AlertCircleOutline" :size="15" />
          错误信息
          <NButton
            v-if="canHandle"
            text
            type="primary"
            size="tiny"
            class="section-action-btn"
            @click="emit('handle')"
          >
            处理
          </NButton>
        </h3>
        <p class="error-text">{{ record.error_message }}</p>
      </section>
    </div>

    <NEmpty v-else description="暂无详细信息" size="small" />
  </NCard>
</template>

<style scoped>
.detail-card {
  /* 定义列表的标签列宽：只在本组件使用，不进全局令牌体系 */
  --label-col: 72px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-weight: var(--weight-semibold);
  color: var(--text-1);
}

.detail-sections {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin: 0 0 var(--space-3);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  color: var(--text-2);
}

.section-title.is-error {
  color: var(--danger-500);
}

.section-title.is-timeout {
  color: var(--warning-500);
}

/* 超时段与错误段同构（2px 左侧强调线），但走 warning —— 超时是环境问题，不是数据错误 */
.timeout-section {
  padding-left: var(--space-3);
  border-left: 2px solid var(--warning-500);
}

.timeout-mechanism {
  margin: var(--space-3) 0 0;
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--text-2);
}

.section-action-btn {
  margin-left: auto;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin: 0;
}

.info-line {
  display: grid;
  grid-template-columns: var(--label-col) minmax(0, 1fr);
  gap: var(--space-3);
  align-items: baseline;
}

.info-label {
  font-size: var(--text-xs);
  /* 12px 小字用 --text-2：--text-3 对白底只有 3.5:1，低于 WCAG AA 的 4.5:1 */
  color: var(--text-2);
}

.info-value {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-1);
  overflow-wrap: anywhere;
}

.info-value.is-secondary {
  color: var(--text-2);
}

.overview-text {
  margin: 0;
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--text-2);
}

/* 错误段靠左侧强调线 + 语义色文字，不铺浅红底：2px 是强调线宽，不是间距档位 */
.error-section {
  padding-left: var(--space-3);
  border-left: 2px solid var(--danger-500);
}

.error-text {
  margin: 0;
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
  color: var(--danger-500);
  overflow-wrap: anywhere;
}
</style>
