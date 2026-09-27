<script setup lang="ts">
/**
 * 安全设置 - 修改密码 tab（纯展示）
 *
 * 状态在父组件（NModal/NTabPane 会卸载内容，子组件持状态会在切 tab 时丢失）；
 * 样式随迁自 AdminConfigDrawer（.section-title / .form-actions）。
 */
import { NButton, NFormItem, NInput, NSpace } from 'naive-ui'

defineProps<{
  currentPassword: string
  newPassword: string
  confirmPassword: string
  saving: boolean
}>()

const emit = defineEmits<{
  'update:currentPassword': [value: string]
  'update:newPassword': [value: string]
  'update:confirmPassword': [value: string]
  submit: []
}>()
</script>

<template>
  <div>
    <div class="section-title">修改密码</div>
    <NSpace vertical size="small">
      <NFormItem label="当前密码" :show-feedback="false" label-placement="left" label-width="80">
        <NInput
          :value="currentPassword"
          type="password"
          show-password-on="click"
          placeholder="输入当前密码"
          size="small"
          @update:value="emit('update:currentPassword', $event)"
        />
      </NFormItem>
      <NFormItem label="新密码" :show-feedback="false" label-placement="left" label-width="80">
        <NInput
          :value="newPassword"
          type="password"
          show-password-on="click"
          placeholder="至少 6 位"
          size="small"
          @update:value="emit('update:newPassword', $event)"
        />
      </NFormItem>
      <NFormItem label="确认密码" :show-feedback="false" label-placement="left" label-width="80">
        <NInput
          :value="confirmPassword"
          type="password"
          show-password-on="click"
          placeholder="再次输入"
          size="small"
          @update:value="emit('update:confirmPassword', $event)"
        />
      </NFormItem>
      <div class="form-actions">
        <NButton
          type="primary"
          size="small"
          :loading="saving"
          :disabled="!currentPassword || !newPassword || !confirmPassword"
          @click="emit('submit')"
        >
          修改密码
        </NButton>
      </div>
    </NSpace>
  </div>
</template>

<style scoped>
.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-1);
  margin-bottom: 12px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}
</style>
