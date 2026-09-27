<script setup lang="ts">
/**
 * TmdbSetupBanner — TMDB 未配置 / 无效时的引导条
 *
 * 从 NAlert 改为自有样式：NAlert 会带上组件库自己的底色与描边，与本页其它
 * 提示元素的视觉语言不一致；直接用语义令牌拼装，暗色模式自动跟随。
 *
 * 只在"确实需要用户动手"时出现（未配置 / 已配置但校验失败），
 * 配置正常时完全不占用首屏空间。
 */
import { ref, computed, onMounted } from 'vue'
import { NButton, NIcon } from 'naive-ui'
import { CheckmarkCircleOutline, KeyOutline, SettingsOutline } from '@vicons/ionicons5'
import { configApi } from '@/shared/api/config'
import type { ApiTokenStatus } from '@/shared/types/common'
import { TmdbSetupWizard } from '@/modules/settings'

const props = defineProps<{
  /** 紧凑模式（用于设置页内嵌）：配置正常时显示一行状态 */
  compact?: boolean
}>()

const emit = defineEmits<{
  (e: 'configured'): void
}>()

const loading = ref(true)
const tokenStatus = ref<ApiTokenStatus | null>(null)
const showWizard = ref(false)
const dismissed = ref(false)

/** 仅在需要用户处理时展示引导 */
const needsAttention = computed(() => {
  if (dismissed.value || !tokenStatus.value) return false
  return !tokenStatus.value.is_configured || tokenStatus.value.is_valid === false
})

const isHealthy = computed(() => Boolean(tokenStatus.value?.is_configured) && tokenStatus.value?.is_valid !== false)

const bannerTone = computed(() =>
  tokenStatus.value?.is_configured ? 'danger' : 'warning',
)

const statusInfo = computed(() => {
  if (!tokenStatus.value?.is_configured) {
    return {
      title: '尚未配置 TMDB API',
      desc: '刮削功能依赖 TMDB 元数据，需要先填入 API Token',
    }
  }
  return {
    title: 'TMDB API Token 无效',
    desc: tokenStatus.value.error_message || '请检查或重新配置 Token',
  }
})

const actionText = computed(() => (tokenStatus.value?.is_configured ? '重新配置' : '立即配置'))

async function loadStatus() {
  loading.value = true
  try {
    tokenStatus.value = await configApi.getApiTokenStatus()
  } catch (error) {
    console.error('获取 TMDB 配置状态失败:', error)
  } finally {
    loading.value = false
  }
}

function handleSuccess() {
  loadStatus()
  emit('configured')
}

onMounted(loadStatus)

defineExpose({ loadStatus, openWizard: () => (showWizard.value = true) })
</script>

<template>
  <div class="tmdb">
    <!-- 需要用户处理：引导条 -->
    <div v-if="!loading && needsAttention" class="banner" :class="`is-${bannerTone}`">
      <span class="banner-icon" aria-hidden="true">
        <NIcon :component="tokenStatus?.is_configured ? SettingsOutline : KeyOutline" :size="16" />
      </span>
      <div class="banner-text">
        <p class="banner-title">{{ statusInfo.title }}</p>
        <p class="banner-desc">{{ statusInfo.desc }}</p>
      </div>
      <NButton size="small" type="primary" class="banner-action" @click="showWizard = true">
        {{ actionText }}
      </NButton>
      <button type="button" class="dismiss" aria-label="本次会话不再提示" @click="dismissed = true">
        ×
      </button>
    </div>

    <!-- 紧凑模式且一切正常：一行状态文字 -->
    <p v-else-if="!loading && isHealthy && props.compact" class="inline-ok">
      <NIcon :component="CheckmarkCircleOutline" :size="14" />
      TMDB API 已配置
    </p>

    <TmdbSetupWizard
      v-model:show="showWizard"
      :initial-status="tokenStatus"
      @success="handleSuccess"
    />
  </div>
</template>

<style scoped>
.banner {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--tone-border);
  border-radius: var(--radius-lg);
  background: var(--tone-bg);
}

/* 未配置 = 警告（需要动手）；已配置但无效 = 危险（配置有问题） */
.banner.is-warning {
  --tone-bg: var(--warning-50);
  --tone-border: var(--warning-50);
  --tone-fg: var(--warning-500);
}

.banner.is-danger {
  --tone-bg: var(--danger-50);
  --tone-border: var(--danger-50);
  --tone-fg: var(--danger-500);
}

.banner-icon {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  border-radius: var(--radius-sm);
  background: var(--bg-surface);
  color: var(--tone-fg);
}

.banner-text {
  flex: 1;
  min-width: 0;
}

.banner-title {
  font-size: var(--text-base);
  font-weight: var(--weight-medium);
  color: var(--text-1);
}

.banner-desc {
  margin-top: 1px;
  font-size: var(--text-sm);
  color: var(--text-2);
}

.banner-action {
  flex-shrink: 0;
}

.dismiss {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-3);
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  transition: color var(--duration-fast) var(--ease-in-out);
}

.dismiss:hover {
  color: var(--text-1);
}

.inline-ok {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--success-500);
}

@media (max-width: 767px) {
  .banner {
    flex-wrap: wrap;
  }

  .banner-text {
    flex-basis: calc(100% - 40px);
  }

  .banner-action {
    margin-left: 40px;
  }
}
</style>
