<script setup lang="ts">
/**
 * 「使用全局配置」开关行（高级设置 4 个标签页共用）
 *
 * 状态在父组件：本组件只做 v-model 透传。
 */
import { NSwitch } from 'naive-ui'

defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<template>
  <div class="global-switch">
    <span>使用全局配置</span>
    <NSwitch
      :value="modelValue"
      @update:value="emit('update:modelValue', $event)"
    />
  </div>
</template>

<style scoped>
/* 全局配置开关 */
.global-switch {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgb(var(--brand-rgb) / 8%);
  border-radius: 10px;
  margin-bottom: 16px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-1);
}
</style>