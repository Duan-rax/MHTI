<script setup lang="ts">
/**
 * 115 账号卡（settings 域私有展示件）
 *
 * 纯展示：输入一份账号详情，输出「身份行 + 容量条 + 信息列表」，不碰接口。
 * 从 Cloud115Settings 拆出是因为面板已同时承担登录/退出/扫码/刷新四个流程，
 * 再叠三层展示版式就没人敢改了。
 *
 * 三块都是「拿不到就不渲染」：昵称缺失不编造、容量缺原始字节不画进度条，
 * 数据不全时宁可少显示一块，也不显示一块错的。
 */
import { computed, ref } from 'vue'
import { NSkeleton } from 'naive-ui'
import type { Cloud115AccountInfo } from '@/shared/types/common'
import { formatDateTime, formatPercent } from '@/shared/utils/format'
import StatusBadge from '@/shared/components/business/StatusBadge.vue'

const props = defineProps<{
  account: Cloud115AccountInfo | null
  /** 账号接口拿不到当前设备名时的兜底（来自本地保存的设备端配置） */
  fallbackDeviceLabel?: string
  /** 正在探测账号信息（首次加载时显示骨架） */
  loading?: boolean
}>()

const avatarFailed = ref(false)

const isSessionInvalid = computed(() => props.account?.is_session_valid === false)

const sessionBadge = computed(() =>
  isSessionInvalid.value
    ? { status: 'error' as const, text: '登录已失效' }
    : { status: 'success' as const, text: '已登录' },
)

const identity = computed(() => {
  const profile = props.account?.account
  if (!profile) return null
  const name = profile.nickname || (profile.user_id ? `UID ${profile.user_id}` : '115 网盘账号')
  const meta = [
    profile.user_id ? `UID ${profile.user_id}` : '',
    profile.device_count ? `已登录设备 ${profile.device_count} 台` : '',
  ].filter(Boolean)
  return {
    name,
    meta: meta.join(' · '),
    avatar: profile.avatar_url,
    initial: name.trim().charAt(0) || '1',
  }
})

/** 容量：缺原始字节或百分比就不画进度条（画出来的一定是真的） */
const storage = computed(() => {
  const info = props.account?.storage
  if (!info || info.used_percent === null || !info.used_text) return null
  const percent = Math.min(Math.max(info.used_percent, 0), 100)
  return {
    percent,
    // formatPercent 收的是 0~1 的比值，而后端给的 used_percent 是 0~100
    percentText: formatPercent(percent / 100, 1),
    valueText: `已用 ${info.used_text} / ${info.total_text ?? '—'}`,
  }
})

const membershipText = computed(() => {
  const info = props.account?.membership
  if (!info) return '—'
  if (!info.is_vip) return '普通用户'
  const expiry = info.is_forever ? '永久有效' : info.expire_date ? `${info.expire_date} 到期` : ''
  return [info.level_name, expiry].filter(Boolean).join(' · ')
})

/** 最近登录：拿不到就显示 —，不拿本地保存时间冒充 */
const lastLoginText = computed(() => {
  const device = props.account?.device
  if (!device?.login_at) return '—'
  return formatDateTime(device.login_at, 'datetime') + (device.city ? ` · ${device.city}` : '')
})

const facts = computed(() => [
  { label: '会员', value: membershipText.value },
  {
    label: '登录设备',
    value: props.account?.device?.name || props.fallbackDeviceLabel || '—',
  },
  { label: '最近登录', value: lastLoginText.value },
])
</script>

<template>
  <div v-if="loading && !account" class="identity" aria-busy="true">
    <NSkeleton circle :width="44" :height="44" />
    <div class="identity-main">
      <NSkeleton text style="width: 120px" />
      <NSkeleton text style="width: 180px" />
    </div>
  </div>

  <div v-else-if="identity" class="identity">
    <span class="avatar">
      <img
        v-if="identity.avatar && !avatarFailed"
        :src="identity.avatar"
        alt=""
        @error="avatarFailed = true"
      />
      <span v-else class="avatar-initial" aria-hidden="true">{{ identity.initial }}</span>
    </span>
    <div class="identity-main">
      <p class="identity-name">{{ identity.name }}</p>
      <p v-if="identity.meta" class="identity-meta">{{ identity.meta }}</p>
    </div>
    <StatusBadge :status="sessionBadge.status" :text="sessionBadge.text" />
  </div>

  <div v-if="storage" class="storage">
    <div class="storage-head">
      <span class="stat-label">容量</span>
      <span class="storage-value">{{ storage.valueText }}</span>
    </div>
    <div
      class="storage-track"
      role="progressbar"
      aria-label="115 网盘容量占用"
      :aria-valuemin="0"
      :aria-valuemax="100"
      :aria-valuenow="storage.percent"
      :aria-valuetext="storage.valueText"
    >
      <div class="storage-fill" :style="{ width: `${storage.percent}%` }" />
    </div>
    <p class="storage-percent">占用 {{ storage.percentText }}</p>
  </div>

  <dl class="facts">
    <div v-for="fact in facts" :key="fact.label" class="fact">
      <dt class="stat-label">{{ fact.label }}</dt>
      <dd class="fact-value">{{ fact.value }}</dd>
    </div>
  </dl>
</template>

<style scoped>
.identity {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  overflow: hidden;
  border: 1px solid var(--border-1);
  border-radius: var(--radius-full);
  background: var(--bg-hover);
}

.avatar img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initial {
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  color: var(--text-2);
}

.identity-main {
  display: flex;
  flex: 1 1 160px;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 0;
}

.identity-name {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-snug);
  color: var(--text-1);
  overflow-wrap: anywhere;
}

.identity-meta {
  margin: 0;
  font-size: var(--text-xs);
  color: var(--text-2);
  font-variant-numeric: tabular-nums;
}

.storage {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.storage-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-3);
}

.stat-label {
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  color: var(--text-2);
}

.storage-value {
  font-size: var(--text-sm);
  color: var(--text-1);
  font-variant-numeric: tabular-nums;
}

.storage-track {
  height: 6px;
  overflow: hidden;
  border-radius: var(--radius-full);
  background: var(--bg-hover);
}

.storage-fill {
  height: 100%;
  border-radius: var(--radius-full);
  background: var(--brand-500);
  transition: width var(--duration-normal) var(--ease-out);
}

.storage-percent {
  margin: 0;
  font-size: var(--text-xs);
  color: var(--text-2);
  font-variant-numeric: tabular-nums;
}

/* 定义列表：不套卡片、不加分割线，靠留白分组（窄屏自动降为单列） */
.facts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: var(--space-3) var(--space-4);
  margin: 0;
}

.fact {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 0;
}

.fact-value {
  margin: 0;
  font-size: var(--text-base);
  color: var(--text-1);
  overflow-wrap: anywhere;
}
</style>
