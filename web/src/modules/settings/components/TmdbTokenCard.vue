<script setup lang="ts">
/**
 * TMDB 认证分组（状态行 + 帮助 + 手动输入 Token 挂载点）
 *
 * 逻辑在父组件（useTmdbToken）；本组件为纯展示 + 事件转发。
 * 状态行同时表达两件事：Token 是否可用、R18（成人内容）是否看得到——后者决定
 * 刮削能不能找到结果，是那个状态行里最容易被误解的一项。
 */
import { NButton, NCollapse, NCollapseItem, NIcon, NInput } from 'naive-ui'
import { OpenOutline } from '@vicons/ionicons5'
import type { ApiTokenStatus } from '@/shared/types/common'
import SettingsSection from '@/modules/settings/components/SettingsSection.vue'
import SettingsField from '@/modules/settings/components/SettingsField.vue'
import TmdbStatusCard from '@/modules/settings/components/tmdb/TmdbStatusCard.vue'

type BadgeTone = 'success' | 'warning' | 'error' | 'info' | 'pending' | 'default'

defineProps<{
  status: ApiTokenStatus | null
  statusConfig: { status: BadgeTone; text: string }
  adultConfig: { status: BadgeTone; text: string }
  tokenLoading: boolean
  tokenSaving: boolean
  tokenInput: string
  verifyTime: string | null
  notice?: string
}>()

const emit = defineEmits<{
  'update:tokenInput': [value: string]
  revalidate: []
  delete: []
  'open-wizard': []
  'save-token': []
}>()

const openExternal = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer')
}
</script>

<template>
  <SettingsSection
    title="TMDB 认证"
    description="刮削所需的 API 凭据，失效时所有刮削任务都会失败"
    :notice="notice"
  >
    <TmdbStatusCard
      :status="status"
      :status-config="statusConfig"
      :adult-config="adultConfig"
      :token-loading="tokenLoading"
      :verify-time="verifyTime"
      @revalidate="emit('revalidate')"
      @delete="emit('delete')"
      @open-wizard="emit('open-wizard')"
    />

    <p class="help-line">
      TMDB API 用于获取剧集的标题、简介与图片，需要一个免费的 API Token。
      <NButton
        text
        type="primary"
        size="small"
        @click="openExternal('https://www.themoviedb.org/settings/api')"
      >
        <template #icon>
          <NIcon :component="OpenOutline" />
        </template>
        前往 TMDB 获取
      </NButton>
    </p>

    <NCollapse>
      <NCollapseItem title="手动输入 Token" name="manual">
        <SettingsField
          label="API Token"
          hint="以 eyJ 开头的 Read Access Token；向导不可用时手动粘贴"
          width="full"
        >
          <NInput
            :value="tokenInput"
            type="textarea"
            placeholder="粘贴 TMDB API Read Access Token"
            :rows="3"
            class="token-input"
            @update:value="emit('update:tokenInput', $event)"
          />
        </SettingsField>
        <div class="manual-actions">
          <NButton
            type="primary"
            :loading="tokenSaving"
            :disabled="!tokenInput.trim()"
            @click="emit('save-token')"
          >
            保存并验证
          </NButton>
        </div>
      </NCollapseItem>
    </NCollapse>
  </SettingsSection>
</template>

<style scoped>
.help-line {
  margin: 0;
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
  color: var(--text-2);
}

.token-input :deep(.n-input__textarea-el) {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
}

.manual-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-3);
}
</style>
