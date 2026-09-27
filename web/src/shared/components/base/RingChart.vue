<script setup lang="ts">
/**
 * RingChart — 环形占比图
 *
 * 用 conic-gradient 绘制扇区，内圆用页面/表面色挖空。图例中的数值统一等宽，
 * 位数变化时不会左右抖动。
 */
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    data: { label: string; value: number; color: string }[]
    size?: number
  }>(),
  { size: 120 },
)

const total = computed(() => props.data.reduce((sum, item) => sum + item.value, 0))

const segments = computed(() => {
  let cursor = 0
  return props.data.map((item) => {
    const percentage = total.value > 0 ? (item.value / total.value) * 100 : 0
    const start = cursor
    cursor += (percentage / 100) * 360
    return { ...item, percentage, startAngle: start, endAngle: cursor }
  })
})

const ringBackground = computed(() => {
  // 无数据时显示一圈中性轨道，而不是空白（空白看起来像渲染失败）
  if (total.value === 0) return 'conic-gradient(var(--bg-active) 0deg 360deg)'
  const stops = segments.value
    .filter((seg) => seg.value > 0)
    .map((seg) => `${seg.color} ${seg.startAngle}deg ${seg.endAngle}deg`)
    .join(', ')
  return `conic-gradient(${stops})`
})
</script>

<template>
  <div class="ring-chart">
    <div
      class="ring"
      :style="{ width: `${size}px`, height: `${size}px`, background: ringBackground }"
    >
      <div class="ring-hole">
        <span class="ring-total tabular">{{ total }}</span>
        <span class="ring-caption">总计</span>
      </div>
    </div>

    <dl class="legend">
      <div v-for="item in segments" :key="item.label" class="legend-row">
        <span class="legend-dot" :style="{ background: item.color }" aria-hidden="true" />
        <dt class="legend-label">{{ item.label }}</dt>
        <dd class="legend-value tabular">{{ item.value }}</dd>
        <dd class="legend-percent tabular">{{ item.percentage.toFixed(0) }}%</dd>
      </div>
    </dl>
  </div>
</template>

<style scoped>
.ring-chart {
  display: flex;
  align-items: center;
  gap: var(--space-6);
}

.ring {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border-radius: var(--radius-full);
}

/* 挖空内圆用表面色，与卡片底色一致 */
.ring-hole {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 72%;
  height: 72%;
  border-radius: var(--radius-full);
  background: var(--bg-surface);
}

.ring-total {
  font-size: var(--text-xl);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-tight);
  color: var(--text-1);
}

.ring-caption {
  font-size: var(--text-xs);
  color: var(--text-2);
}

/* -------------------- 图例 -------------------- */
.legend {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin: 0;
  min-width: 0;
}

.legend-row {
  display: grid;
  /* 标签自适应，两个数值列定宽对齐，避免长短标签把数字推得参差 */
  grid-template-columns: 8px 1fr auto auto;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
}

.legend-label {
  color: var(--text-2);
}

.legend-value {
  margin: 0;
  min-width: 32px;
  text-align: right;
  font-weight: var(--weight-medium);
  color: var(--text-1);
}

.legend-percent {
  margin: 0;
  min-width: 36px;
  text-align: right;
  color: var(--text-3);
}

@media (max-width: 767px) {
  .ring-chart {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-4);
  }

  .ring {
    align-self: center;
  }
}
</style>
