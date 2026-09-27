<script setup lang="ts">
import { onMounted } from 'vue'
import { NConfigProvider, NMessageProvider, NDialogProvider, zhCN, dateZhCN } from 'naive-ui'
import { useTheme } from '@/shared/composables/useTheme'
import { useWebSocket } from '@/shared/composables/useWebSocket'

/**
 * 应用根：仅提供 Provider 与路由出口。
 * 布局由嵌套路由承担（壳路由见 router/shell.ts），
 * 登录等全页路由不套壳，不再需要条件判断。
 */

const { theme, themeOverrides } = useTheme()
const { connect } = useWebSocket()

// 初始化 WebSocket 连接（全局单例，连接时机保持不变）
onMounted(() => {
  connect()
})
</script>

<template>
  <NConfigProvider
    :theme="theme"
    :theme-overrides="themeOverrides"
    :locale="zhCN"
    :date-locale="dateZhCN"
  >
    <NDialogProvider>
      <NMessageProvider>
        <router-view />
      </NMessageProvider>
    </NDialogProvider>
  </NConfigProvider>
</template>
