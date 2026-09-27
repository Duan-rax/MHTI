<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  NModal,
  NCard,
  NTabs,
  NTabPane,
  NButton,
  NIcon,
  NDivider,
  useDialog,
} from 'naive-ui'
import {
  CloseOutline,
  LogOutOutline,
} from '@vicons/ionicons5'
import { useAuthStore } from '@/stores/auth'
import { useAuthSessions } from '@/modules/auth/hooks/useAuthSessions'
import { useLoginHistory } from '@/modules/auth/hooks/useLoginHistory'
import { usePasswordForm } from '@/modules/auth/hooks/usePasswordForm'
import { useProfileHeader } from '@/modules/auth/hooks/useProfileHeader'
import SecurityPasswordTab from '@/modules/auth/components/SecurityPasswordTab.vue'
import ProfileHeaderTab from '@/modules/auth/components/ProfileHeaderTab.vue'
import SessionsTab from '@/modules/auth/components/SessionsTab.vue'
import LoginHistoryTab from '@/modules/auth/components/LoginHistoryTab.vue'
import LogViewer from '@/shared/components/business/LogViewer.vue'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
}>()

const router = useRouter()
const authStore = useAuthStore()
const dialog = useDialog()

// ========== 个人资料相关（状态经 hook 在父持有）==========
const {
  editingUsername,
  newUsername,
  usernamePassword,
  savingUsername,
  avatarSrc,
  loadProfile,
  handleAvatarChange,
  handleDeleteAvatar,
  startEditUsername,
  cancelEditUsername,
  saveUsername,
  resetProfileForm,
} = useProfileHeader()

// ========== 安全设置相关（状态经 hook 在父持有）==========
const {
  currentPassword,
  newPassword,
  confirmPassword,
  savingPassword,
  handleChangePassword,
} = usePasswordForm()

// ========== 会话管理 / 登录历史（共用 hooks）==========
const {
  sessions,
  loadingSessions,
  loadSessions,
  revokeSession: handleRevokeSession,
  revokeAllSessions: handleRevokeAllSessions,
} = useAuthSessions()

const {
  historyItems,
  loadingHistory,
  pagination,
  loadHistory,
  columns: historyColumns,
} = useLoginHistory('drawer')

// 关闭弹窗
const handleClose = () => {
  emit('update:show', false)
  // 重置表单状态
  resetProfileForm()
  currentPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
}

// ========== 退出登录 ==========
const handleLogout = () => {
  dialog.warning({
    title: '确认退出',
    content: '确定要退出登录吗？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      await authStore.logout()
      handleClose()
      router.push('/login')
    },
  })
}

// 监听弹窗打开
watch(() => props.show, (newVal) => {
  if (newVal) {
    loadSessions()
    loadHistory()
  }
})

// 初始化
onMounted(() => {
  loadProfile()
})
</script>

<template>
  <NModal
    :show="show"
    :mask-closable="true"
    :close-on-esc="true"
    transform-origin="center"
    @update:show="(val) => emit('update:show', val)"
  >
    <NCard
      class="admin-modal"
      :bordered="false"
      role="dialog"
      aria-modal="true"
    >
      <!-- 头部 -->
      <template #header>
        <div class="modal-header">
          <span class="modal-title">账户设置</span>
          <NButton quaternary circle size="small" @click="handleClose" aria-label="关闭">
            <template #icon>
              <NIcon :component="CloseOutline" />
            </template>
          </NButton>
        </div>
      </template>

      <!-- 用户信息头部 -->
      <ProfileHeaderTab
        :avatar-src="avatarSrc"
        :username="authStore.username || ''"
        :has-avatar="!!authStore.avatar"
        :editing-username="editingUsername"
        :new-username="newUsername"
        :username-password="usernamePassword"
        :saving-username="savingUsername"
        @avatar-change="handleAvatarChange"
        @delete-avatar="handleDeleteAvatar"
        @start-edit="startEditUsername"
        @update:new-username="newUsername = $event"
        @update:username-password="usernamePassword = $event"
        @save="saveUsername"
        @cancel="cancelEditUsername"
      />

      <NDivider style="margin: 16px 0" />

      <!-- 功能标签页 -->
      <NTabs type="line" animated class="config-tabs">
        <!-- 安全设置 -->
        <NTabPane name="security" tab="安全设置">
          <div class="tab-content">
            <SecurityPasswordTab
              v-model:current-password="currentPassword"
              v-model:new-password="newPassword"
              v-model:confirm-password="confirmPassword"
              :saving="savingPassword"
              @submit="handleChangePassword"
            />
          </div>
        </NTabPane>

        <!-- 会话管理 -->
        <NTabPane name="sessions" tab="会话管理">
          <div class="tab-content">
            <SessionsTab
              :sessions="sessions"
              :loading="loadingSessions"
              @revoke="handleRevokeSession"
              @revoke-all="handleRevokeAllSessions"
            />
          </div>
        </NTabPane>

        <!-- 登录历史 -->
        <NTabPane name="history" tab="登录历史">
          <div class="tab-content">
            <LoginHistoryTab
              :columns="historyColumns"
              :items="historyItems"
              :loading="loadingHistory"
              :pagination="pagination"
              @update:page="loadHistory"
            />
          </div>
        </NTabPane>

        <!-- 系统日志 -->
        <NTabPane name="logs" tab="系统日志">
          <div class="tab-content">
            <LogViewer />
          </div>
        </NTabPane>
      </NTabs>

      <!-- 底部 -->
      <template #footer>
        <NButton type="error" block @click="handleLogout">
          <template #icon>
            <NIcon :component="LogOutOutline" />
          </template>
          退出登录
        </NButton>
      </template>
    </NCard>
  </NModal>
</template>

<style scoped>
.admin-modal {
  width: 620px;
  max-width: 95vw;
  border-radius: 16px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
}

.config-tabs {
  min-height: 360px;
}

.config-tabs :deep(.n-tabs-tab) {
  padding: 10px 16px;
  font-size: 14px;
}

.config-tabs :deep(.n-tab-pane) {
  padding-top: 12px;
}

.tab-content {
  padding: 4px 0;
}


/* 卡片样式覆盖 */
:deep(.n-card-header) {
  padding: 16px 20px;
}

:deep(.n-card__content) {
  padding: 0 20px;
}

:deep(.n-card__footer) {
  padding: 16px 20px;
}

/* 表单项样式 */
:deep(.n-form-item) {
  margin-bottom: 0;
}

:deep(.n-form-item-label) {
  font-size: 13px;
}
</style>
