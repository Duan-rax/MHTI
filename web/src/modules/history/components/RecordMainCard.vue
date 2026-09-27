<script setup lang="ts">
/**
 * 记录详情主卡（海报 + 指标条 + 剧照条）
 *
 * 设计取舍：
 * - 标题不在卡里重复 —— 页头已有唯一 h1，卡内再写一遍同一个标题只是噪音；
 * - 「评分 / 评分人数 / 首播 / 耗时」从「图标 + 文字」的一行并成指标条（小标签 + 大值），
 *   一眼可比，也不靠彩色胶囊表达状态；
 * - 剧照从独立的 220px 全宽大图降为卡内 96px 高的媒体条：1~2 张图不值得占一张卡，
 *   但它仍是「剧集」的有效证据，所以留在卡里靠留白与主内容分隔；
 * - 图片一律 loading="lazy" decoding="async"（海报/剧照在首屏下方，没必要阻塞）。
 */
import { computed } from 'vue'
import { NCard, NIcon } from 'naive-ui'
import { ImageOutline } from '@vicons/ionicons5'
import type { HistoryRecordDetail } from '@/modules/history/types'
import { formatDurationCn, resolveDurationSeconds } from '@/modules/history/utils'

const props = defineProps<{
  record: HistoryRecordDetail
  /** 每秒自增的时间戳：驱动耗时实时跳动（由页面统一持有定时器） */
  nowTick: number
}>()

// 处理中的记录 duration_seconds 还是 0（后端跑完才写），但耗时必须在——否则
// 用户看不到任何时间反馈；跑完后再换成后端写的定值
const durationText = computed(() =>
  props.record.status === 'running' || props.record.duration_seconds
    ? formatDurationCn(resolveDurationSeconds(props.record, props.nowTick))
    : null,
)

/** 指标条：只渲染确实有值的项，避免出现「评分 —」这类空槽 */
const stats = computed(() => {
  const record = props.record
  const items: { label: string; value: string; suffix?: string }[] = []
  if (record.rating) items.push({ label: '评分', value: record.rating.toFixed(1), suffix: '/10' })
  if (record.votes) items.push({ label: '评分人数', value: String(record.votes) })
  if (record.release_date) items.push({ label: '首播', value: record.release_date })
  if (durationText.value) items.push({ label: '耗时', value: durationText.value })
  return items
})

/** 原名 / 翻译：一行一项的字段表 */
const extras = computed(() => {
  const record = props.record
  const items: { label: string; value: string }[] = []
  if (record.original_title) items.push({ label: '原名', value: record.original_title })
  if (record.translator) items.push({ label: '翻译', value: record.translator })
  return items
})

/** 媒体条：缩略图与剧照都是可选字段，缺哪个少哪个 */
const media = computed(() => {
  const record = props.record
  const items: { src: string; label: string }[] = []
  if (record.thumb_url) items.push({ src: record.thumb_url, label: '缩略图' })
  if (record.episode_still_url) items.push({ src: record.episode_still_url, label: '剧照' })
  return items
})

const posterAlt = computed(() => `${props.record.title || props.record.task_name || '记录'} 海报`)
</script>

<template>
  <NCard class="main-card">
    <div class="hero">
      <div class="poster-wrapper">
        <img
          v-if="record.poster_url"
          :src="record.poster_url"
          class="poster"
          :alt="posterAlt"
          loading="lazy"
          decoding="async"
        />
        <div v-else class="poster-placeholder" aria-hidden="true">
          <NIcon :component="ImageOutline" :size="36" />
        </div>
      </div>

      <div class="hero-body">
        <dl v-if="stats.length" class="stat-bar">
          <div v-for="item in stats" :key="item.label" class="stat">
            <dt class="stat-label">{{ item.label }}</dt>
            <dd class="stat-value">
              {{ item.value }}<span v-if="item.suffix" class="stat-suffix">{{ item.suffix }}</span>
            </dd>
          </div>
        </dl>

        <p v-if="record.plot" class="plot">{{ record.plot }}</p>

        <div v-if="record.tags.length" class="tags-row">
          <span v-for="tag in record.tags" :key="tag" class="meta-tag">{{ tag }}</span>
        </div>

        <dl v-if="extras.length" class="extra-list">
          <div v-for="item in extras" :key="item.label" class="extra-row">
            <dt class="extra-label">{{ item.label }}</dt>
            <dd class="extra-value">{{ item.value }}</dd>
          </div>
        </dl>

        <!-- 剧照：跟在文字列尾部，而不是另起一条全宽媒体带 —— 1 张图撑不满一行，
             放右列既填掉海报高度差留下的空白，也不用再画一条分隔线 -->
        <div v-if="media.length" class="media-row">
          <figure v-for="item in media" :key="item.label" class="media-item">
            <img
              :src="item.src"
              :alt="item.label"
              loading="lazy"
              decoding="async"
              class="media-image"
            />
            <figcaption class="media-label">{{ item.label }}</figcaption>
          </figure>
        </div>
      </div>
    </div>
  </NCard>
</template>

<style scoped>
.main-card {
  overflow: hidden;
}

.hero {
  display: flex;
  gap: var(--space-5);
}

.poster-wrapper {
  flex-shrink: 0;
  width: 200px;
}

.poster,
.poster-placeholder {
  width: 100%;
  aspect-ratio: 2 / 3;
  border-radius: var(--radius-md);
}

.poster {
  object-fit: cover;
  display: block;
}

.poster-placeholder {
  background: var(--bg-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-3);
}

.hero-body {
  flex: 1;
  min-width: 0;
}

/* 指标条：小标签 + 大值，用留白分列，不画分割线 */
.stat-bar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-8);
  margin: 0 0 var(--space-4);
}

.stat {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.stat-label {
  font-size: var(--text-xs);
  /* 12px 小字必须过 WCAG AA：--text-3 对白底 3.5:1 / 暗底 3.7:1 不达标，--text-2 是 5.1:1 / 6.9:1 */
  color: var(--text-2);
}

.stat-value {
  margin: 0;
  font-size: var(--text-base);
  font-weight: var(--weight-medium);
  line-height: var(--leading-tight);
  color: var(--text-1);
  font-variant-numeric: tabular-nums;
}

.stat-suffix {
  margin-left: 1px;
  font-size: var(--text-xs);
  font-weight: var(--weight-normal);
  color: var(--text-2);
}

.plot {
  margin: 0;
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: var(--text-2);
  overflow-wrap: anywhere;
}

.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-4);
}

/* 标签是元数据标注，用中性底；品牌色留给操作与选中态 */
.meta-tag {
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-xs);
  background: var(--bg-subtle);
  font-size: var(--text-xs);
  color: var(--text-2);
}

.extra-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin: var(--space-4) 0 0;
}

.extra-row {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr);
  gap: var(--space-3);
  align-items: baseline;
}

.extra-label {
  font-size: var(--text-sm);
  color: var(--text-2);
}

.extra-value {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-2);
  overflow-wrap: anywhere;
}

/* 剧照行：与「原名」同为次级信息，靠上间距分区 */
.media-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  margin-top: var(--space-5);
}

.media-item {
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-2);
  min-width: 0;
}

.media-image {
  max-height: 96px;
  width: auto;
  max-width: 100%;
  border-radius: var(--radius-sm);
  object-fit: cover;
  display: block;
}

.media-label {
  font-size: var(--text-xs);
  color: var(--text-2);
}

@media (max-width: 768px) {
  .hero {
    flex-direction: column;
    gap: var(--space-4);
  }

  .poster-wrapper {
    width: 150px;
  }

  .stat-bar {
    gap: var(--space-2) var(--space-6);
  }

  .extra-row {
    grid-template-columns: 34px minmax(0, 1fr);
  }
}
</style>
