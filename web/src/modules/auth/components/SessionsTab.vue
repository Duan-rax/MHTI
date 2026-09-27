<script setup lang="ts">
/**
 * 会话管理 tab（纯展示，抽屉用）
 *
 * 状态与数据加载在父组件（useAuthSessions）；样式随迁自 AdminConfigDrawer
 * （section-header/section-title/session-list 及其 :deep/session-name/
 * current-tag/session-info/empty-state）。
 */
import {
  NButton,
  NIcon,
  NList,
  NListItem,
  NSpin,
  NTag,
  NThing,
} from 'naive-ui'
import type { SessionInfo } from '@/modules/auth/api'
import { getDeviceIcon, formatDate } from '@/modules/auth/utils'

defineProps<{
  sessions: SessionInfo[]
  loading: boolean
}>()

const emit = defineEmits<{
  revoke: [sessionId: string]
  revokeAll: []
}>()
</script>

<template>
  <div>
    <div class="section-header">
      <span class="section-title">活跃会话</span>
      <NButton
        size="tiny"
        type="error"
        text
        :disabled="sessions.length <= 1"
        @click="emit('revokeAll')"
      >
        注销其他设备
      </NButton>
    </div>

    <NSpin :show="loading">
      <div v-if="sessions.length === 0" class="empty-state">
        暂无活跃会话
      </div>
      <NList v-else class="session-list">
        <NListItem v-for="session in sessions" :key="session.id">
          <template #prefix>
            <NIcon :size="18" :component="getDeviceIcon(session.device_type)" />
          </template>
          <NThing>
            <template #header>
              <span class="session-name">{{ session.device_name }}</span>
              <NTag v-if="session.is_current" type="success" size="tiny" class="current-tag">
                当前
              </NTag>
            </template>
            <template #description>
              <div class="session-info">
                <span>{{ session.ip_address }}</span>
                <span>{{ formatDate(session.last_used_at) }}</span>
              </div>
            </template>
          </NThing>
          <template #suffix>
            <NButton
              v-if="!session.is_current"
              size="tiny"
              type="error"
              text
              @click="emit('revoke', session.id)"
            >
              注销
            </NButton>
          </template>
        </NListItem>
      </NList>
    </NSpin>
  </div>
</template>

<style scoped>
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-1);
  margin-bottom: 12px;
}

.section-header .section-title {
  margin-bottom: 0;
}

.empty-state {
  text-align: center;
  padding: 24px;
  color: var(--text-2);
  font-size: 14px;
}

.session-list {
  max-height: 240px;
  overflow-y: auto;
}

.session-list :deep(.n-list-item) {
  padding: 8px 0;
}

.session-name {
  font-weight: 500;
  font-size: 14px;
}

.current-tag {
  margin-left: 8px;
}

.session-info {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--text-2);
}
</style>
