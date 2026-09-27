<script setup lang="ts">
/**
 * HomeSkeleton — 首页骨架屏
 *
 * 结构与 HomePage 的实际版面逐块对应（指标带 → 图表两栏 → 最近任务行），
 * 尺寸一致才能避免加载完成瞬间的布局跳动。
 */
import Skeleton from '@/shared/components/base/Skeleton.vue'

const METRIC_ROWS = 3
const TASK_ROWS = 5
</script>

<template>
  <div class="skeleton">
    <!-- 指标带 -->
    <div class="surface metrics">
      <div v-for="i in METRIC_ROWS" :key="i" class="metric">
        <Skeleton width="56px" height="26px" />
        <Skeleton width="48px" height="13px" />
      </div>
    </div>

    <!-- 图表两栏：与首页同为 2:1 -->
    <div class="grid">
      <div class="surface panel">
        <Skeleton width="80px" height="15px" />
        <Skeleton type="rect" height="110px" />
      </div>
      <div class="surface panel">
        <Skeleton width="96px" height="15px" />
        <Skeleton type="circle" width="100px" height="100px" />
      </div>
    </div>

    <!-- 最近任务 -->
    <div class="recent">
      <div class="recent-head">
        <Skeleton width="72px" height="18px" />
        <Skeleton width="56px" height="13px" />
      </div>
      <div v-for="i in TASK_ROWS" :key="i" class="task">
        <Skeleton type="rect" width="30px" height="30px" />
        <div class="task-main">
          <Skeleton width="42%" height="14px" />
          <Skeleton width="24%" height="12px" />
        </div>
        <Skeleton width="52px" height="20px" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton {
  display: flex;
  flex-direction: column;
}

.metrics {
  display: flex;
  align-items: center;
  gap: var(--space-8);
  padding: var(--space-5) var(--space-6);
}

.metric {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.metric + .metric {
  padding-left: var(--space-8);
  border-left: 1px solid var(--border-1);
}

.grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--space-4);
  margin-top: var(--space-4);
}

.panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-5);
}

.panel :last-child {
  flex: 1;
}

.recent {
  margin-top: var(--space-8);
}

.recent-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--border-1);
}

.task {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border-bottom: 1px solid var(--border-1);
}

.task-main {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--space-2);
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

  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
