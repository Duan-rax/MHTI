<script setup lang="ts">
/**
 * 系统设置 tab：TMDB 认证 + 性能设置
 *
 * 逻辑拆分：useTmdbToken（Token 状态机）/ useSystemConfig（性能配置）；
 * 展示拆分：TmdbTokenCard / PerformanceSettings；本组件只做组装。
 *
 * 原先外面还套了一层「系统设置」NCard + 两条 NDivider 分节：版式件已经能表达
 * 分组标题，外层卡只是给同一页再加一层边框，故去掉。
 */
import { onMounted } from 'vue'
import { useTmdbToken } from '@/modules/settings/hooks/useTmdbToken'
import { useSystemConfig } from '@/modules/settings/hooks/useSystemConfig'
import TmdbTokenCard from '@/modules/settings/components/TmdbTokenCard.vue'
import PerformanceSettings from '@/modules/settings/components/PerformanceSettings.vue'
import TmdbSetupWizard from './TmdbSetupWizard.vue'

const {
  tokenLoading,
  tokenSaving,
  tokenInput,
  tokenStatus,
  tokenError,
  showWizard,
  statusConfig,
  adultConfig,
  formatVerifyTime,
  loadTokenStatus,
  saveToken,
  revalidateToken,
  deleteToken,
  handleWizardSuccess,
} = useTmdbToken()

const {
  loading: perfLoading,
  saving,
  scrapeThreads,
  taskTimeout,
  retryCount,
  concurrentDownloads,
  loadError,
  saveError,
  reload: loadSystemConfig,
  submit: saveSystemConfig,
} = useSystemConfig()

onMounted(() => {
  loadSystemConfig()
  loadTokenStatus()
})
</script>

<template>
  <TmdbTokenCard
    :status="tokenStatus"
    :status-config="statusConfig"
    :adult-config="adultConfig"
    :token-loading="tokenLoading"
    :token-saving="tokenSaving"
    :token-input="tokenInput"
    :verify-time="tokenStatus?.last_verified ? formatVerifyTime(tokenStatus.last_verified) : null"
    :notice="tokenError"
    @update:token-input="tokenInput = $event"
    @revalidate="revalidateToken"
    @delete="deleteToken"
    @open-wizard="showWizard = true"
    @save-token="saveToken"
  />

  <PerformanceSettings
    v-model:scrape-threads="scrapeThreads"
    v-model:task-timeout="taskTimeout"
    v-model:retry-count="retryCount"
    v-model:concurrent-downloads="concurrentDownloads"
    :saving="saving"
    :loading="perfLoading"
    :load-error="loadError"
    :save-error="saveError"
    @retry="loadSystemConfig"
    @save="saveSystemConfig"
  />

  <!-- TMDB 配置向导 -->
  <TmdbSetupWizard
    v-model:show="showWizard"
    :initial-status="tokenStatus"
    @success="handleWizardSuccess"
  />
</template>
