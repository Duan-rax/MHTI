<script setup lang="ts">
/**
 * AppUserMenu — 顶栏用户入口
 *
 * 只负责展示头像与下拉菜单，并把选择结果上抛：具体动作（打开账户抽屉、
 * 跳转安全设置、退出登录）由 AppLayout 编排，避免组件同时承担导航与副作用。
 */
import { computed, h } from 'vue'
import { useRouter } from 'vue-router'
import { NAvatar, NDropdown, NIcon } from 'naive-ui'
import type { DropdownOption } from 'naive-ui'
import {
  LogOutOutline,
  PersonCircleOutline,
  PersonOutline,
  ShieldCheckmarkOutline,
} from '@vicons/ionicons5'
import { useAuthStore } from '@/stores/auth'

const emit = defineEmits<{
  /** 打开账户配置抽屉 */
  openAccount: []
  /** 退出登录（由父级做二次确认） */
  logout: []
}>()

const router = useRouter()
const authStore = useAuthStore()

/** 头像：后端存 base64（部分带 data: 前缀），两种都要兼容 */
const avatarSrc = computed(() => {
  if (!authStore.avatar) return undefined
  return authStore.avatar.startsWith('data:')
    ? authStore.avatar
    : `data:image/png;base64,${authStore.avatar}`
})

const username = computed(() => authStore.username || '管理员')

function renderIcon(component: typeof PersonOutline) {
  return () => h(NIcon, { component, size: 16 })
}

const options = computed<DropdownOption[]>(() => [
  {
    key: 'header',
    type: 'render',
    render: () =>
      h('div', { class: 'user-menu-header' }, [
        h('span', { class: 'user-menu-name' }, username.value),
        h('span', { class: 'user-menu-role' }, '管理员'),
      ]),
  },
  { key: 'divider-1', type: 'divider' },
  { label: '账户与安全', key: 'account', icon: renderIcon(PersonCircleOutline) },
  { label: '安全设置页', key: 'security', icon: renderIcon(ShieldCheckmarkOutline) },
  { key: 'divider-2', type: 'divider' },
  { label: '退出登录', key: 'logout', icon: renderIcon(LogOutOutline) },
])

function handleSelect(key: string) {
  switch (key) {
    case 'account':
      emit('openAccount')
      break
    case 'security':
      router.push('/security')
      break
    case 'logout':
      emit('logout')
      break
    default:
      break
  }
}
</script>

<template>
  <NDropdown
    trigger="click"
    placement="bottom-end"
    :options="options"
    :show-arrow="false"
    @select="handleSelect"
  >
    <button type="button" class="user-trigger" :aria-label="`账户菜单：${username}`">
      <NAvatar :size="26" round :src="avatarSrc" class="user-avatar">
        <NIcon v-if="!avatarSrc" :component="PersonOutline" :size="15" />
      </NAvatar>
    </button>
  </NDropdown>
</template>

<style scoped>
.user-trigger {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  padding: 0;
  border: none;
  border-radius: var(--radius-full);
  background: transparent;
  cursor: pointer;
  transition: box-shadow var(--duration-fast) var(--ease-in-out);
}

.user-trigger:hover {
  box-shadow: 0 0 0 3px var(--bg-hover);
}

.user-avatar {
  background: var(--brand-100);
  color: var(--brand-600);
  font-size: var(--text-xs);
}
</style>

<!-- 下拉头部为 render 函数产物，不在 scoped 作用域内，故使用全局样式 -->
<style>
.user-menu-header {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--space-2) var(--space-3) var(--space-1);
}

.user-menu-name {
  font-size: var(--text-base);
  font-weight: var(--weight-semibold);
  color: var(--text-1);
}

.user-menu-role {
  font-size: var(--text-xs);
  color: var(--text-2);
}
</style>
