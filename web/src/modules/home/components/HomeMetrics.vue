<script setup lang="ts">
/**
 * 首页指标条
 *
 * 从"三张等宽统计卡片"改为一条指标带：数字 + 标签 + 细分隔线。
 * 理由：三张同尺寸卡片的视觉权重完全相同，读者无法判断哪个最重要，
 * 而且卡片外壳（圆角 + 阴影 + 图标底块）占了 60% 的面积却只承载 2 个信息。
 * 指标带把 3 个数字压缩到一行，层次让给页面标题与下方图表。
 *
 * 每个指标可点击进对应筛选结果，故本身是按钮（键盘可达）。
 */
import { computed } from 'vue'
import AnimatedNumber from '@/shared/components/base/AnimatedNumber.vue'

const props = defineProps<{
  total: number
  success: number
  failed: number
  /** 成功率，用于在副行给出口径 */
  successRate: number
}>()

const emit = defineEmits<{
  navigate: [path: string]
}>()

const metrics = computed(() => [
  { key: 'total', label: '总任务数', value: props.total, path: '/history' },
  { key: 'success', label: '成功', value: props.success, path: '/history?status=success' },
  { key: 'failed', label: '失败', value: props.failed, path: '/history?status=failed' },
])
</script>

<template>
  <div class="metrics">
    <button
      v-for="metric in metrics"
      :key="metric.key"
      type="button"
      class="metric"
      @click="emit('navigate', metric.path)"
    >
      <span class="metric-value tabular">
        <AnimatedNumber :value="metric.value" />
      </span>
      <span class="metric-label">{{ metric.label }}</span>
    </button>

    <p class="metric-note">
      <span class="tabular">{{ successRate }}%</span> 成功率
    </p>
  </div>
</template>

<style scoped>
.metrics {
  display: flex;
  align-items: center;
  gap: var(--space-8);
  padding: var(--space-5) var(--space-6);
  background: var(--bg-surface);
  border: 1px solid var(--border-1);
  border-radius: var(--radius-lg);
}

.metric {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0;
  border: none;
  background: transparent;
  text-align: left;
  font-family: inherit;
  cursor: pointer;
  /* 命中区域向左扩展，避免 8px 间隙里出现死区 */
  margin: calc(var(--space-2) * -1) 0;
  padding: var(--space-2) 0;
}

/* 指标之间用细分隔线，比留白更省横向空间，也比卡片描边更轻 */
.metric + .metric {
  padding-left: var(--space-8);
  border-left: 1px solid var(--border-1);
  margin-left: 0;
}

.metric-value {
  font-size: var(--text-2xl);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  color: var(--text-1);
  transition: color var(--duration-fast) var(--ease-in-out);
}

/* 数字本身不着色：三个指标同属一个整体，颜色只会制造"哪个重要"的误读；
   状态语义交给下方图例与列表里的状态点。悬停时才给出可点击的反馈。 */
.metric-label {
  font-size: var(--text-sm);
  color: var(--text-2);
}

.metric:hover .metric-value {
  color: var(--brand-500);
}

.metric-note {
  margin-left: auto;
  font-size: var(--text-sm);
  color: var(--text-2);
}

.metric-note .tabular {
  color: var(--text-1);
  font-weight: var(--weight-medium);
}

@media (max-width: 767px) {
  .metrics {
    flex-wrap: wrap;
    gap: var(--space-4) var(--space-6);
    padding: var(--space-4);
  }

  .metric + .metric {
    padding-left: var(--space-6);
  }

  .metric-value {
    font-size: var(--text-xl);
  }

  /* 成功率说明在窄屏另起一行，不挤压三个指标 */
  .metric-note {
    flex-basis: 100%;
    margin-left: 0;
    padding-top: var(--space-3);
    border-top: 1px solid var(--border-1);
  }
}
</style>
