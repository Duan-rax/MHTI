import { onMounted, onUnmounted, type Ref } from 'vue'
import { useMessage } from 'naive-ui'
import type { HistoryRecord } from '@/modules/history/types'
import { useWebSocket, type WSMessage } from '@/shared/composables/useWebSocket'

/**
 * 刮削记录实时更新（HistoryPage）
 *
 * 五类消息的增量处理逐字保留：history_created 去重后前插 + 提示、
 * history_updated 按 id 就地 Object.assign、history_deleted 移除并
 * 修正 total、history_cleared 与 history_restored 走全量重载。
 *
 * 注册/卸载仍成对（useWebSocket 单例语义不变）；onMounted 内先 reload
 * 再 registerHandler，与原实现顺序一致。
 */
export function useHistoryRealtime(options: {
  records: Ref<HistoryRecord[]>
  total: Ref<number>
  loading: Ref<boolean>
  /** 全量重载（原 loadRecords） */
  reload: () => void
}) {
  const message = useMessage()
  const { registerHandler, unregisterHandler } = useWebSocket()

  const wsHandler = (msg: WSMessage) => {
    const { type, payload } = msg

    switch (type) {
      case 'history_created': {
        // 新记录创建 - 使用增量更新，避免全量刷新
        // 只在非加载状态下处理，避免数据冲突
        if (!options.loading.value) {
          const newRecord = payload
          // 检查是否已存在（防止重复）
          const exists = options.records.value.some(r => r.id === newRecord.id)
          if (!exists) {
            // 增量更新：插入到列表开头
            options.records.value.unshift(newRecord)
            options.total.value += 1
            // 显示新记录提示
            message.success('新任务已创建')
          }
        }
        break
      }

      case 'history_updated':
        // 记录更新 - 增量更新，只更新变化的字段
        {
          const idx = options.records.value.findIndex(r => r.id === payload.id)
          const target = idx !== -1 ? options.records.value[idx] : undefined
          if (target) {
            Object.assign(target, payload)
          }
        }
        break

      case 'history_deleted':
        // 记录删除 - 从列表中移除
        {
          const idx = options.records.value.findIndex(r => r.id === payload.id)
          if (idx !== -1) {
            options.records.value.splice(idx, 1)
            options.total.value = Math.max(0, options.total.value - 1)
          }
        }
        break

      case 'history_cleared':
      case 'history_restored':
        // 记录清空 / 撤销恢复 - 都是批量结构变化，走全量重载
        options.reload()
        break
    }
  }

  onMounted(() => {
    options.reload()
    registerHandler(wsHandler)
  })

  onUnmounted(() => {
    unregisterHandler(wsHandler)
  })
}
