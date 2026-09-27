<script setup lang="ts">
/**
 * LogViewer — 日志查看（用于账户抽屉等弹窗内）
 *
 * 列表/统计/筛选/自动刷新逻辑见 useLogFeed；本组件只管展示与清空操作。
 *
 * 样式修正：原先用 `var(--border-1)` 取描边色 —— 该变量只在 NCard 等组件的
 * 根元素子树内可达（CLAUDE.md 陷阱 #5），换个位置挂载就会静默失效。现统一用
 * --border-1 令牌。
 *
 * 严重程度表达：左侧 2px 语义色条 + 等宽时间戳，不再整行铺底色。
 * 整行底色在滚动浏览时会把"列表"读成"色块"，而真正需要一眼看到的只是级别。
 */
import { ref, onMounted } from 'vue'
import {
  NButton,
  NInput,
  NPopconfirm,
  NSelect,
  NSpin,
  useMessage,
  type SelectOption,
} from 'naive-ui'
import * as logsApi from '@/shared/api/logs'
import type { SystemLogLevel } from '@/shared/types/common'
import { useLogFeed } from '@/shared/composables/useLogFeed'

const message = useMessage()

const clearing = ref(false)

const {
  loading,
  logs,
  total,
  filterLevel,
  filterSearch,
  loadLogs,
  loadStats,
  refresh,
  handleFilterChange,
  errorCount,
  warningCount,
} = useLogFeed({
  pageSize: () => 100,
  autoRefreshInterval: 30000,
})

/** 'all' 是"不限"的哨兵值，提交时映射回 null（见 useLogFeed.handleFilterChange） */
const levelOptions: SelectOption[] = [
  { label: '全部级别', value: 'all' },
  { label: 'WARNING', value: 'WARNING' },
  { label: 'ERROR', value: 'ERROR' },
  { label: 'CRITICAL', value: 'CRITICAL' },
]

/** 级别 → 语义令牌类（颜色交给 CSS，暗色模式才能自适应） */
function levelClass(level: SystemLogLevel): string {
  return `is-${level.toLowerCase()}`
}

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString('zh-CN', { hour12: false })
}

/**
 * 后端写入 message 时已带上 logger 名（形如 `2026-09-26 00:00:01,796 - server.api.v1.websocket - ...`），
 * 再单独渲染一行来源就是重复信息。只在 message 未包含时才补这一行。
 */
function showSource(log: { logger?: string; message: string }): boolean {
  return Boolean(log.logger) && !log.message.includes(log.logger as string)
}

async function clearAll() {
  clearing.value = true
  try {
    const result = await logsApi.clearLogs()
    message.success(result.message || '日志已清空')
    refresh()
  } catch (error) {
    message.error('清理失败')
    console.error('清理失败:', error)
  } finally {
    clearing.value = false
  }
}

onMounted(() => {
  loadLogs()
  loadStats()
})
</script>

<template>
  <div class="logs">
    <!-- 工具行：统计 + 操作 -->
    <div class="logs-bar">
      <div class="logs-stats">
        <span v-if="errorCount > 0" class="stat is-error">
          <span class="stat-dot" aria-hidden="true" />{{ errorCount }} 错误
        </span>
        <span v-if="warningCount > 0" class="stat is-warning">
          <span class="stat-dot" aria-hidden="true" />{{ warningCount }} 警告
        </span>
        <span v-if="total > 0" class="stat is-muted">共 {{ total }} 条</span>
      </div>

      <div class="logs-actions">
        <NButton size="tiny" quaternary @click="refresh">刷新</NButton>
        <NPopconfirm :to="false" placement="bottom" @positive-click="clearAll">
          <template #trigger>
            <NButton
              size="tiny"
              quaternary
              type="error"
              :loading="clearing"
              :disabled="total === 0"
            >
              清空
            </NButton>
          </template>
          确定清空所有日志？
        </NPopconfirm>
      </div>
    </div>

    <!-- 筛选 -->
    <div class="logs-filter">
      <NSelect
        :value="filterLevel ?? 'all'"
        :options="levelOptions"
        size="small"
        class="level-select"
        @update:value="handleFilterChange"
      />
      <NInput
        v-model:value="filterSearch"
        placeholder="搜索日志内容"
        size="small"
        clearable
        class="search-input"
        @keyup.enter="handleFilterChange"
        @clear="handleFilterChange"
      />
    </div>

    <!-- 列表 -->
    <NSpin :show="loading" size="small">
      <div class="logs-scroll">
        <p v-if="logs.length === 0 && !loading" class="logs-empty">暂无日志记录</p>

        <div
          v-for="log in logs"
          v-else
          :key="log.id"
          class="log-row"
          :class="levelClass(log.level)"
        >
          <div class="log-head">
            <span class="log-time tabular">{{ formatTime(log.timestamp) }}</span>
            <span class="log-level">{{ log.level }}</span>
          </div>
          <p class="log-message">{{ log.message }}</p>
          <p v-if="showSource(log)" class="log-source">{{ log.logger }}</p>
        </div>
      </div>
    </NSpin>

    <p class="logs-hint">仅记录警告和错误 · 完整日志见 data/logs/app.log</p>
  </div>
</template>

<style scoped>
.logs {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

/* -------------------- 工具行 -------------------- */
.logs-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.logs-stats {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--text-xs);
}

.stat {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.stat-dot {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background: currentColor;
}

.stat.is-error {
  color: var(--danger-500);
}

.stat.is-warning {
  color: var(--warning-500);
}

.stat.is-muted {
  color: var(--text-2);
}

.logs-actions {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.logs-filter {
  display: flex;
  gap: var(--space-2);
}

.search-input {
  flex: 1;
  min-width: 0;
}

/* -------------------- 列表 -------------------- */
.logs-scroll {
  max-height: 280px;
  overflow-y: auto;
  border: 1px solid var(--border-1);
  border-radius: var(--radius-md);
}

.logs-empty {
  padding: var(--space-8) 0;
  text-align: center;
  font-size: var(--text-sm);
  color: var(--text-2);
}

.log-row {
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--border-1);
  /* 左侧语义色条：默认透明，只有警告及以上着色 */
  border-left: 2px solid transparent;
}

.log-row:last-child {
  border-bottom: none;
}

.log-row.is-warning {
  border-left-color: var(--warning-500);
}

.log-row.is-error,
.log-row.is-critical {
  border-left-color: var(--danger-500);
  background: var(--danger-50);
}

.log-head {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.log-time {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-3);
}

.log-level {
  font-size: 10px;
  font-weight: var(--weight-semibold);
  letter-spacing: 0.04em;
  color: var(--text-2);
}

.log-row.is-warning .log-level {
  color: var(--warning-500);
}

.log-row.is-error .log-level,
.log-row.is-critical .log-level {
  color: var(--danger-500);
}

.log-row.is-info .log-level {
  color: var(--brand-500);
}

.log-message {
  margin-top: 2px;
  font-size: var(--text-xs);
  line-height: var(--leading-normal);
  color: var(--text-1);
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.log-source {
  margin-top: 2px;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text-3);
}

.logs-hint {
  padding-top: var(--space-2);
  border-top: 1px solid var(--border-1);
  text-align: center;
  font-size: 11px;
  color: var(--text-3);
}
</style>
