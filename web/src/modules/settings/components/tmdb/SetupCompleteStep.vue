<script setup lang="ts">
/**
 * TMDB 配置向导 - 步骤 3（完成）
 *
 * 成功结果页 + 「开始使用」按钮。点击经 complete 事件上抛。
 */
import { NButton, NIcon, NResult, NSpace } from 'naive-ui'
import { CheckmarkCircleOutline } from '@vicons/ionicons5'

const emit = defineEmits<{
  complete: []
}>()
</script>

<template>
  <div class="step-content">
    <NResult
      status="success"
      title="配置完成！"
      description="TMDB API 已成功配置，您现在可以开始使用刮削功能了"
    >
      <template #icon>
        <div class="success-icon">
          <NIcon :component="CheckmarkCircleOutline" :size="72" color="var(--success-500)" />
        </div>
      </template>
      <template #footer>
        <NSpace justify="center">
          <NButton type="primary" size="large" @click="emit('complete')">
            开始使用
          </NButton>
        </NSpace>
      </template>
    </NResult>
  </div>
</template>

<style scoped>
/* 入场动画与弹跳动画都是项目禁项（CLAUDE.md §6）：完成页保持静态，
   成功状态由图标色与文案表达 */
.success-icon {
  display: inline-flex;
}
</style>