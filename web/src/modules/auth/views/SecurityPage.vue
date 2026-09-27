<script setup lang="ts">
/**
 * SecurityPage — 安全设置（壳内隐藏页，从用户菜单或 ⌘K 进入）
 *
 * 页面骨架改用 PageContainer（标题取自路由 meta），不再自己写 NPageHeader，
 * 否则与壳的页头规范重复且样式各异。
 *
 * 会话列表的信息密度做了收敛：四个时间字段原本平均分布在一行，读起来是一条长句；
 * 现在拆成"设备 + 当前标记"主行与"最近活跃 / 过期"次行，IP 与登录时间降到最低一档，
 * 因为多数场景下用户只关心"这是哪台设备、要不要注销"。
 */
import { onMounted } from 'vue'
import { NButton, NDataTable, NIcon, NSpin } from 'naive-ui'
import { useAuthSessions } from '@/modules/auth/hooks/useAuthSessions'
import { useLoginHistory } from '@/modules/auth/hooks/useLoginHistory'
import { getDeviceIcon, formatDate } from '@/modules/auth/utils'
import PageContainer from '@/shared/components/base/PageContainer.vue'
import StatusBadge from '@/shared/components/business/StatusBadge.vue'
import EmptyState from '@/shared/components/base/EmptyState.vue'

const {
  sessions,
  loadingSessions,
  loadSessions,
  revokeSession: handleRevokeSession,
  revokeAllSessions: handleRevokeAll,
} = useAuthSessions()

const {
  historyItems,
  loadingHistory,
  pagination,
  loadHistory,
  columns: historyColumns,
} = useLoginHistory('page')

function handlePageChange(page: number) {
  loadHistory(page)
}

onMounted(() => {
  loadSessions()
  loadHistory()
})
</script>

<template>
  <PageContainer>
    <template #actions>
      <NButton
        type="error"
        ghost
        :disabled="sessions.length <= 1"
        @click="handleRevokeAll"
      >
        注销其他设备
      </NButton>
    </template>

    <!-- 活跃会话 -->
    <section class="block">
      <h2 class="block-title">
        活跃会话
        <span class="block-hint tabular">{{ sessions.length }}</span>
      </h2>

      <NSpin :show="loadingSessions">
        <EmptyState
          v-if="sessions.length === 0 && !loadingSessions"
          icon="empty"
          title="暂无活跃会话"
          description="登录后建立的会话会显示在这里"
        />
        <ul v-else class="sessions">
          <li v-for="session in sessions" :key="session.id" class="session">
            <span class="session-icon" aria-hidden="true">
              <NIcon :component="getDeviceIcon(session.device_type)" :size="18" />
            </span>

            <div class="session-main">
              <p class="session-device">
                {{ session.device_name }}
                <StatusBadge v-if="session.is_current" status="success" text="当前设备" size="small" />
              </p>
              <p class="session-meta">
                <span>最近活跃 {{ formatDate(session.last_used_at) }}</span>
                <span class="session-sep" aria-hidden="true">·</span>
                <span>过期 {{ formatDate(session.expires_at) }}</span>
              </p>
              <p class="session-faint">
                {{ session.ip_address }} · 登录于 {{ formatDate(session.created_at) }}
              </p>
            </div>

            <NButton
              v-if="!session.is_current"
              size="small"
              type="error"
              quaternary
              @click="handleRevokeSession(session.id)"
            >
              注销
            </NButton>
          </li>
        </ul>
      </NSpin>
    </section>

    <!-- 登录历史 -->
    <section class="block">
      <h2 class="block-title">登录历史</h2>
      <NSpin :show="loadingHistory">
        <NDataTable
          :columns="historyColumns"
          :data="historyItems"
          :pagination="pagination"
          :remote="true"
          :bordered="false"
          size="small"
          @update:page="handlePageChange"
        />
      </NSpin>
    </section>
  </PageContainer>
</template>

<style scoped>
.block {
  margin-top: var(--space-6);
  padding: var(--space-5);
  background: var(--bg-surface);
  border: 1px solid var(--border-1);
  border-radius: var(--radius-lg);
}

.block:first-child {
  margin-top: 0;
}

.block-title {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
  font-size: var(--text-base);
  font-weight: var(--weight-semibold);
  color: var(--text-1);
}

.block-hint {
  font-size: var(--text-sm);
  font-weight: var(--weight-normal);
  color: var(--text-3);
}

/* -------------------- 会话列表 -------------------- */
.sessions {
  margin: 0;
  padding: 0;
  list-style: none;
}

.session {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  /* 10 条以上会话时行高直接决定扫读成本，故取 10px 而非默认 16px */
  padding: 10px 0;
  border-bottom: 1px solid var(--border-1);
}

.session:last-child {
  border-bottom: none;
}

.session-icon {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: var(--radius-sm);
  background: var(--bg-hover);
  color: var(--text-2);
}

.session-main {
  flex: 1;
  min-width: 0;
}

.session-device {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-base);
  font-weight: var(--weight-medium);
  color: var(--text-1);
}

.session-meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: 1px;
  font-size: var(--text-sm);
  line-height: 1.4;
  color: var(--text-2);
}

.session-sep {
  color: var(--text-3);
}

/* 最低一档：仅在需要排查时才会读，平时不该参与扫读 */
.session-faint {
  margin-top: 1px;
  font-size: var(--text-xs);
  line-height: 1.4;
  color: var(--text-3);
}

@media (max-width: 767px) {
  .block {
    padding: var(--space-4);
  }

  .session-meta {
    flex-wrap: wrap;
  }
}
</style>
