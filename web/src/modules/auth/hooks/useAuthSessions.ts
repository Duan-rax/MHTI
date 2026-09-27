import { ref } from 'vue'
import { useMessage, useDialog } from 'naive-ui'
import { useAuthStore } from '@/stores/auth'
import type { SessionInfo } from '@/modules/auth/api'

/**
 * 活跃会话管理（AdminConfigDrawer / SecurityPage 共用）
 *
 * 加载/注销单条/注销其他设备；对话框与提示文案与原两处逐字一致。
 * 触发时机（watch/onMounted）由使用方持有。
 */
export function useAuthSessions() {
  const authStore = useAuthStore()
  const message = useMessage()
  const dialog = useDialog()

  const sessions = ref<SessionInfo[]>([])
  const loadingSessions = ref(false)

  // 加载会话列表
  const loadSessions = async () => {
    loadingSessions.value = true
    try {
      sessions.value = await authStore.getSessions()
    } catch {
      message.error('加载会话列表失败')
    } finally {
      loadingSessions.value = false
    }
  }

  // 注销指定会话
  const revokeSession = (sessionId: string) => {
    dialog.warning({
      title: '确认注销',
      content: '确定要注销该设备的登录状态吗？',
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        try {
          await authStore.revokeSession(sessionId)
          message.success('会话已注销')
          await loadSessions()
        } catch {
          message.error('注销失败')
        }
      },
    })
  }

  // 注销所有其他会话
  const revokeAllSessions = () => {
    dialog.warning({
      title: '确认注销',
      content: '确定要注销所有其他设备的登录状态吗？',
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        try {
          await authStore.revokeAllSessions()
          message.success('已注销所有其他会话')
          await loadSessions()
        } catch {
          message.error('注销失败')
        }
      },
    })
  }

  return {
    sessions,
    loadingSessions,
    loadSessions,
    revokeSession,
    revokeAllSessions,
  }
}
