import { ref } from 'vue'
import { useMessage } from 'naive-ui'
import { useAuthStore } from '@/stores/auth'

/**
 * 修改密码表单（AdminConfigDrawer 安全设置 tab）
 *
 * 状态与校验逻辑归属父组件（NModal/NTabPane 会卸载内容，
 * 状态若放子组件会在切 tab 时丢失）；校验文案逐字保留。
 */
export function usePasswordForm() {
  const authStore = useAuthStore()
  const message = useMessage()

  const currentPassword = ref('')
  const newPassword = ref('')
  const confirmPassword = ref('')
  const savingPassword = ref(false)

  const handleChangePassword = async () => {
    if (!currentPassword.value) {
      message.warning('请输入当前密码')
      return
    }
    if (!newPassword.value) {
      message.warning('请输入新密码')
      return
    }
    if (newPassword.value.length < 6) {
      message.warning('新密码至少 6 个字符')
      return
    }
    if (newPassword.value !== confirmPassword.value) {
      message.warning('两次输入的密码不一致')
      return
    }

    savingPassword.value = true
    try {
      const result = await authStore.changePassword({
        current_password: currentPassword.value,
        new_password: newPassword.value,
      })
      if (result.success) {
        message.success('密码修改成功')
        currentPassword.value = ''
        newPassword.value = ''
        confirmPassword.value = ''
      } else {
        message.error(result.message)
      }
    } catch {
      message.error('修改失败')
    } finally {
      savingPassword.value = false
    }
  }

  return {
    currentPassword,
    newPassword,
    confirmPassword,
    savingPassword,
    handleChangePassword,
  }
}
