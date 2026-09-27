<script setup lang="ts">
/**
 * HomePage — 主界面
 *
 * 版面顺序即阅读优先级：页头 → 指标带 → 趋势主图 + 结果分布 → 最近任务。
 *
 * 与旧版相比删掉了「快捷入口」区块：它的三项（手动任务 / 刮削记录 / 文件管理）
 * 与顶部主导航完全重合，既不能提供新的可达性，也让首屏多出三张同质卡片。
 * 需要快速跳转时，顶部导航与 ⌘K 命令面板都能覆盖。
 *
 * 同时去掉了所有入场动画与卡片错峰延迟：首屏动画除了拖慢信息到达没有别的效果，
 * 且叠加上骨架屏切换会让画面连续跳动两次。
 */
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NIcon } from 'naive-ui'
import { AddOutline } from '@vicons/ionicons5'
import { useHomeStats } from '@/modules/home/hooks/useHomeStats'
import { useResponsiveValue } from '@/shared/composables/useMobileLayout'
import type { HistoryRecord } from '@/modules/history'
import HomeSkeleton from '@/modules/home/components/HomeSkeleton.vue'
import RingChart from '@/shared/components/base/RingChart.vue'
import BarChart from '@/shared/components/base/BarChart.vue'
import TmdbSetupBanner from '@/modules/home/components/TmdbSetupBanner.vue'
import HomeMetrics from '@/modules/home/components/HomeMetrics.vue'
import HomeRecentTasks from '@/modules/home/components/HomeRecentTasks.vue'
import PageContainer from '@/shared/components/base/PageContainer.vue'

const router = useRouter()
const { loading, totalTasks, successCount, failedCount, recentTasks, weeklyStats, refresh } =
  useHomeStats()

const ringSize = useResponsiveValue({ mobile: 92, tablet: 100, desktop: 108 })
const barHeight = useResponsiveValue({ mobile: 96, tablet: 108, desktop: 120 })

/** 成功率：无任务时为 0，避免出现 NaN */
const successRate = computed(() => {
  const finished = successCount.value + failedCount.value
  return finished === 0 ? 0 : Math.round((successCount.value / finished) * 100)
})

/** 图形颜色取语义令牌，与页面其它状态色保持同一套 */
const ringData = computed(() => [
  { label: '成功', value: successCount.value, color: 'var(--success-500)' },
  { label: '失败', value: failedCount.value, color: 'var(--danger-500)' },
])

const goTo = (path: string) => router.push(path)
const goToDetail = (record: HistoryRecord) => router.push(`/history/${record.id}`)

onMounted(refresh)
</script>

<template>
  <PageContainer>
    <template #actions>
      <NButton type="primary" @click="goTo('/scan')">
        <template #icon>
          <NIcon :component="AddOutline" :size="16" />
        </template>
        新建任务
      </NButton>
    </template>

    <HomeSkeleton v-if="loading" />

    <template v-else>
      <TmdbSetupBanner />

      <HomeMetrics
        :total="totalTasks"
        :success="successCount"
        :failed="failedCount"
        :success-rate="successRate"
        @navigate="goTo"
      />

      <!-- 趋势为主线（占 2 份），分布为辅（占 1 份）：原实现两者等宽，主次不分 -->
      <div class="chart-grid">
        <section class="panel">
          <h2 class="panel-title">近 7 天趋势</h2>
          <BarChart :data="weeklyStats" :height="barHeight" />
        </section>

        <section class="panel">
          <h2 class="panel-title">任务结果分布</h2>
          <RingChart :data="ringData" :size="ringSize" />
        </section>
      </div>

      <HomeRecentTasks
        :recent-tasks="recentTasks"
        @navigate="goTo"
        @create="goTo('/scan')"
        @open-detail="goToDetail"
      />
    </template>
  </PageContainer>
</template>

<style scoped>
.chart-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--space-4);
  margin-top: var(--space-4);
}

.panel {
  padding: var(--space-5);
  background: var(--bg-surface);
  border: 1px solid var(--border-1);
  border-radius: var(--radius-lg);
  min-width: 0;
}

.panel-title {
  margin-bottom: var(--space-4);
  font-size: var(--text-base);
  font-weight: var(--weight-semibold);
  color: var(--text-1);
}

/* 移动端单列：柱状图最小可读宽度约 280px，两列并排会挤到无法读数 */
@media (max-width: 767px) {
  .chart-grid {
    grid-template-columns: 1fr;
  }

  .panel {
    padding: var(--space-4);
  }
}
</style>
