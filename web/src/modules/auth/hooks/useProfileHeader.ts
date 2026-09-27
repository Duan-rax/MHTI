import { ref, computed } from 'vue'
import { useMessage, useDialog } from 'naive-ui'
import { useAuthStore } from '@/stores/auth'

/**
 * 账户设置 - 个人资料头部（头像 + 用户名编辑）
 *
 * 状态与逻辑归属父组件（抽屉在 tabs 打开时不可卸载，状态放父保证
 * 编辑一半切 tab 再回来仍在编辑态）；校验与文案逐字保留。
 */
export function useProfileHeader() {
  const authStore = useAuthStore()
  const message = useMessage()
  const dialog = useDialog()

  const loadingProfile = ref(false)
  const editingUsername = ref(false)
  const newUsername = ref('')
  const usernamePassword = ref('')
  const savingUsername = ref(false)

  // 头像地址（base64 或 data: 前缀原样）
  const avatarSrc = computed(() => {
    if (authStore.avatar) {
      if (authStore.avatar.startsWith('data:')) {
        return authStore.avatar
      }
      return `data:image/png;base64,${authStore.avatar}`
    }
    return undefined
  })

  // 初始化：拉取个人资料（失败静默）
  const loadProfile = async () => {
    loadingProfile.value = true
    try {
      await authStore.getProfile()
    } catch {
      // 静默失败
    } finally {
      loadingProfile.value = false
    }
  }

  // ========== 头像处理 ==========
  const handleAvatarChange = (file: File | null | undefined) => {
    if (!file) return

    // 检查文件大小 (500KB)
    if (file.size > 500 * 1024) {
      message.error('头像文件过大，请选择小于 500KB 的图片')
      return
    }

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      message.error('请选择图片文件')
      return
    }

    // 转换为 base64
    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64 = e.target?.result as string
      try {
        const result = await authStore.updateAvatar(base64)
        if (result.success) {
          message.success('头像更新成功')
        } else {
          message.error(result.message)
        }
      } catch {
        message.error('头像上传失败')
      }
    }
    reader.readAsDataURL(file)
  }

  const handleDeleteAvatar = () => {
    dialog.warning({
      title: '确认删除',
      content: '确定要删除头像吗？',
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        try {
          const result = await authStore.deleteAvatar()
          if (result.success) {
            message.success('头像已删除')
          } else {
            message.error(result.message)
          }
        } catch {
          message.error('删除失败')
        }
      },
    })
  }

  // ========== 用户名修改 ==========
  const startEditUsername = () => {
    editingUsername.value = true
    newUsername.value = authStore.username || ''
    usernamePassword.value = ''
  }

  const cancelEditUsername = () => {
    editingUsername.value = false
    newUsername.value = ''
    usernamePassword.value = ''
  }

  const saveUsername = async () => {
    if (!newUsername.value.trim()) {
      message.warning('请输入新用户名')
      return
    }
    if (newUsername.value.length < 3) {
      message.warning('用户名至少 3 个字符')
      return
    }
    if (!usernamePassword.value) {
      message.warning('请输入当前密码')
      return
    }

    savingUsername.value = true
    try {
      const result = await authStore.updateUsername({
        new_username: newUsername.value,
        password: usernamePassword.value,
      })
      if (result.success) {
        message.success('用户名修改成功')
        editingUsername.value = false
        newUsername.value = ''
        usernamePassword.value = ''
      } else {
        message.error(result.message)
      }
    } catch {
      message.error('修改失败')
    } finally {
      savingUsername.value = false
    }
  }

  // 关闭抽屉时的表单重置
  const resetProfileForm = () => {
    editingUsername.value = false
    newUsername.value = ''
    usernamePassword.value = ''
  }

  return {
    loadingProfile,
    editingUsername,
    newUsername,
    usernamePassword,
    savingUsername,
    avatarSrc,
    loadProfile,
    handleAvatarChange,
    handleDeleteAvatar,
    startEditUsername,
    cancelEditUsername,
    saveUsername,
    resetProfileForm,
  }
}
