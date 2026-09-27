<script setup lang="ts">
/**
 * 刮削日志卡（时间轴 + 折叠 + 实时/断开指示）
 *
 * 只吃展示数据（logs/isConnected/needsRealtime），不依赖 record。
 *
 * 折叠策略：默认只展开「未完成的步骤」与「最后一步」的明细，其余只显示步骤名——
 * scrape_logs 会随每次重刮累积（实测一条记录已有 21 步），全部展开会把详情页拉到两千
 * 多像素。`展开全部`是全局开关，用户单点某一步优先于它；实时推送期间不重置折叠状态。
 * 状态只靠圆点与文字的颜色区分。
 */
import { computed, ref } from 'vue'
import { NButton, NCard, NEmpty, NIcon } from 'naive-ui'
import {
  ChevronDownOutline,
  ChevronForwardOutline,
  CloudOfflineOutline,
  ListOutline,
  RadioButtonOnOutline,
} from '@vicons/ionicons5'
import type { ScrapeLogStep } from '@/modules/history/types'

const props = defineProps<{
  logs: ScrapeLogStep[]
  isConnected: boolean
  needsRealtime: boolean
}>()

// ========== 折叠状态 ==========
const expandAll = ref(false)
/** 用户手动点开的步骤：有值时覆盖默认策略 */
const overrides = ref<Record<number, boolean>>({})

/**
 * 超时兜底步骤（与后端 TIMEOUT_STEP_NAME 同名）：completed 为 false，但语义是警告，
 * 不是失败——否则会跟着真失败一起显示成「失败」。
 */
const TIMEOUT_STEP_NAME = '任务超时'
const isTimeoutStep = (step: ScrapeLogStep) => step.name === TIMEOUT_STEP_NAME
/** 步骤状态档位：ok / timeout / bad —— 圆点与文字颜色共用同一判定 */
const stepKind = (step: ScrapeLogStep) => (step.completed ? 'ok' : isTimeoutStep(step) ? 'timeout' : 'bad')
const STATE_TEXT: Record<string, string> = { ok: '完成', timeout: '超时', bad: '失败' }

const failedCount = computed(() => props.logs.filter((step) => !step.completed).length)

/** 最后一步正在跑时，它的明细就是用户最想看的进度 */
const openByDefault = (index: number) =>
  !props.logs[index]?.completed || index === props.logs.length - 1

const isOpen = (index: number) => overrides.value[index] ?? (expandAll.value || openByDefault(index))

const toggleStep = (index: number) => {
  overrides.value = { ...overrides.value, [index]: !isOpen(index) }
}

const toggleAll = () => {
  expandAll.value = !expandAll.value
  overrides.value = {}
}
</script>

<template>
  <NCard class="log-card">
    <template #header>
      <div class="card-header">
        <NIcon :component="ListOutline" :size="20" />
        <span>刮削日志</span>

        <!-- WebSocket 连接状态：小圆点 + 文字，不用彩色胶囊标签 -->
        <span v-if="isConnected && needsRealtime" class="live-state is-live">
          <NIcon :component="RadioButtonOnOutline" :size="12" />
          实时
        </span>
        <span v-else-if="!isConnected && needsRealtime" class="live-state is-offline">
          <NIcon :component="CloudOfflineOutline" :size="12" />
          连接断开
        </span>

        <span v-if="logs.length" class="log-summary">
          {{ logs.length }} 步<template v-if="failedCount"> · 失败 {{ failedCount }}</template>
        </span>
        <NButton
          v-if="logs.length > 1"
          text
          size="tiny"
          class="expand-all-btn"
          :aria-label="expandAll ? '收起全部步骤明细' : '展开全部步骤明细'"
          @click="toggleAll"
        >
          {{ expandAll ? '收起全部' : '展开全部' }}
        </NButton>
      </div>
    </template>

    <NEmpty v-if="!logs.length" description="暂无日志" />

    <div v-else class="log-list">
      <div
        v-for="(step, index) in logs"
        :key="index"
        class="log-step"
        :class="{ 'is-last': index === logs.length - 1 }"
      >
        <!-- 时间轴圆点：实心=完成，实心红=失败，警告色=超时（无光晕） -->
        <span class="step-dot" :class="`is-${stepKind(step)}`" aria-hidden="true"></span>
        <span class="step-num">{{ index + 1 }}</span>
        <span class="step-name">{{ step.name }}</span>
        <span class="step-state" :class="`is-${stepKind(step)}`">{{ STATE_TEXT[stepKind(step)] }}</span>
        <NButton
          v-if="step.logs.length"
          text
          size="tiny"
          class="step-toggle"
          :aria-expanded="isOpen(index)"
          :aria-label="`${isOpen(index) ? '收起' : '展开'}「${step.name}」的日志明细`"
          @click="toggleStep(index)"
        >
          <template #icon>
            <NIcon :component="isOpen(index) ? ChevronDownOutline : ChevronForwardOutline" />
          </template>
        </NButton>
        <span v-else class="step-toggle is-placeholder" aria-hidden="true"></span>

        <div v-if="step.logs.length && isOpen(index)" class="step-messages">
          <div
            v-for="(log, logIndex) in step.logs"
            :key="logIndex"
            class="msg-item"
            :class="`is-${log.level}`"
          >
            {{ log.message }}
          </div>
        </div>
      </div>
    </div>
  </NCard>
</template>

<style scoped>
.log-card {
  /* 时间轴几何：只在本组件内使用，不进入全局令牌体系 */
  --dot-size: 10px;
  --num-col: 20px;
  --toggle-col: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-weight: var(--weight-semibold);
  color: var(--text-1);
}

.live-state {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
}

.live-state.is-live {
  color: var(--success-500);
}

.live-state.is-offline {
  color: var(--warning-500);
}

.log-summary {
  margin-left: auto;
  font-size: var(--text-xs);
  font-weight: var(--weight-normal);
  color: var(--text-3);
  white-space: nowrap;
}

.expand-all-btn {
  font-size: var(--text-xs);
}

.log-list {
  display: flex;
  flex-direction: column;
}

.log-step {
  position: relative;
  display: grid;
  grid-template-columns: var(--dot-size) var(--num-col) minmax(0, 1fr) auto var(--toggle-col);
  align-items: center;
  column-gap: var(--space-2);
  padding-bottom: var(--space-4);
}

.log-step.is-last {
  padding-bottom: 0;
}

/* 竖向连线：从本步圆点下方连到下一步，末步不画 */
.log-step:not(.is-last)::before {
  content: '';
  position: absolute;
  left: calc(var(--dot-size) / 2 - 0.5px);
  top: calc(var(--dot-size) + var(--space-1));
  bottom: var(--space-1);
  width: 1px;
  background: var(--border-1);
}

.step-dot {
  width: var(--dot-size);
  height: var(--dot-size);
  border-radius: var(--radius-full);
}

.step-dot.is-ok {
  background: var(--success-500);
}

.step-dot.is-bad {
  background: var(--danger-500);
}

.step-dot.is-timeout {
  background: var(--warning-500);
}

.step-num {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--text-3);
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.step-name {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--text-1);
  overflow-wrap: anywhere;
}

.step-state {
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  white-space: nowrap;
}

.step-state.is-ok {
  color: var(--text-3);
}

.step-state.is-bad {
  color: var(--danger-500);
}

.step-state.is-timeout {
  color: var(--warning-500);
}

.step-toggle {
  justify-self: end;
}

.step-toggle.is-placeholder {
  width: var(--toggle-col);
}

.step-messages {
  grid-column: 3 / -1;
  margin-top: var(--space-2);
  padding-left: var(--space-3);
  border-left: 1px solid var(--border-1);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.msg-item {
  font-size: var(--text-sm);
  color: var(--text-2);
  line-height: var(--leading-normal);
  overflow-wrap: anywhere;
  word-break: break-word;
}

.msg-item.is-success {
  color: var(--success-500);
}

.msg-item.is-warning {
  color: var(--warning-500);
}

.msg-item.is-error {
  color: var(--danger-500);
}
</style>
