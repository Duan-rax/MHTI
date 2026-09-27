<script setup lang="ts">
/**
 * 首页最近任务
 *
 * 从"卡片里再套一层列表"改为页面级区块：标题行 + 分隔线 + 平铺行。
 * 原实现把整个列表塞进一张 NCard，行又用负 margin 去贴卡片边缘以制造
 * 满宽悬停效果 —— 这层卡片外壳除了圆角没有任何作用，却让页面多出一圈描边。
 *
 * 状态用 StatusBadge（点 + 文字），不再用彩色 NTag：一列彩色胶囊会让
 * 列表中真正需要注意的失败项被淡化。
 */
import { NIcon } from 'naive-ui'
import { FilmOutline } from '@vicons/ionicons5'
import type { HistoryRecord } from '@/modules/history'
import type { BadgeStatus } from '@/shared/components/business/StatusBadge.vue'
import StatusBadge from '@/shared/components/business/StatusBadge.vue'
import EmptyState from '@/shared/components/base/EmptyState.vue'

defineProps<{
  recentTasks: HistoryRecord[]
}>()

const emit = defineEmits<{
  navigate: [path: string]
  create: []
  openDetail: [record: HistoryRecord]
}>()

const STATUS_MAP: Record<string, { tone: BadgeStatus; text: string }> = {
  success: { tone: 'success', text: '成功' },
  failed: { tone: 'error', text: '失败' },
  cancelled: { tone: 'warning', text: '取消' },
}

function statusOf(status: string) {
  return STATUS_MAP[status] ?? { tone: 'default' as BadgeStatus, text: status }
}

/** 相对时间：一周内用"x 分钟/小时/天前"，更早直接给日期 */
function formatTime(time: string): string {
  if (!time) return '—'
  const date = new Date(time)
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} 天前`
  return time.replace('T', ' ').slice(0, 10)
}

/** 季集号：只在至少有一项存在时才显示，避免出现 S00E00 */
function episodeLabel(record: HistoryRecord): string | null {
  const season = record.season_number
  const episode = record.episode_number
  if (!season && !episode) return null
  const parts: string[] = []
  if (season) parts.push(`S${String(season).padStart(2, '0')}`)
  if (episode) parts.push(`E${String(episode).padStart(2, '0')}`)
  return parts.join('')
}
</script>

<template>
  <section class="recent">
    <header class="recent-head">
      <h2 class="recent-title">最近任务</h2>
      <button type="button" class="link-btn" @click="emit('navigate', '/history')">
        查看全部
      </button>
    </header>

    <EmptyState
      v-if="recentTasks.length === 0"
      title="暂无任务记录"
      description="创建第一个刮削任务后，这里会显示最近的处理结果"
      action-text="创建任务"
      @action="emit('create')"
    />

    <ul v-else class="task-list">
      <li v-for="task in recentTasks" :key="task.id">
        <button type="button" class="task" @click="emit('openDetail', task)">
          <span class="task-icon" aria-hidden="true">
            <NIcon :component="FilmOutline" :size="16" />
          </span>

          <span class="task-main">
            <span class="task-name">{{ task.title || task.task_name }}</span>
            <span class="task-meta">
              <span v-if="episodeLabel(task)" class="task-episode tabular">
                {{ episodeLabel(task) }}
              </span>
              <span class="task-time">{{ formatTime(task.executed_at) }}</span>
            </span>
          </span>

          <StatusBadge :status="statusOf(task.status).tone" :text="statusOf(task.status).text" />
        </button>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.recent {
  margin-top: var(--space-8);
}

.recent-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-4);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--border-1);
}

.recent-title {
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  color: var(--text-1);
}

.link-btn {
  padding: 0;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: var(--text-sm);
  color: var(--text-2);
  cursor: pointer;
  transition: color var(--duration-fast) var(--ease-in-out);
}

.link-btn:hover {
  color: var(--brand-500);
}

/* -------------------- 行列表 -------------------- */
.task-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.task {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-3) var(--space-3);
  /* 负 margin 让悬停底色铺到内容区两侧，视觉上不缩进 */
  margin: 0 calc(var(--space-3) * -1);
  border: none;
  border-bottom: 1px solid var(--border-1);
  border-radius: var(--radius-sm);
  background: transparent;
  text-align: left;
  font-family: inherit;
  cursor: pointer;
  transition: background-color var(--duration-fast) var(--ease-in-out);
}

.task-list li:last-child .task {
  border-bottom: none;
}

.task:hover {
  background: var(--bg-hover);
  border-bottom-color: transparent;
}

.task-icon {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  border-radius: var(--radius-sm);
  background: var(--bg-hover);
  color: var(--text-2);
}

.task-main {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  gap: 1px;
}

.task-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--text-base);
  font-weight: var(--weight-medium);
  color: var(--text-1);
}

.task-meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--text-3);
}

.task-episode {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-2);
}

@media (max-width: 767px) {
  .task {
    padding: var(--space-3) var(--space-2);
    margin: 0 calc(var(--space-2) * -1);
  }

  .task-icon {
    display: none;
  }
}
</style>
