/**
 * WebSocket 消息类型（useWebSocket 拆分，纯类型零运行时）
 */

// WebSocket 消息类型
export interface WSMessage {
  type: string
  job_id?: string
  client_id?: string
  payload: any
  timestamp: string
}

// 任务进度信息
export interface JobProgress {
  step: string
  progress: number
  message: string
}

// 需要用户操作的信息
export interface NeedActionInfo {
  job_id: string
  action_type: string
  options: any
}

// 历史记录更新信息
export interface HistoryUpdate {
  type: 'created' | 'updated' | 'deleted' | 'cleared'
  record?: any
  id?: string
  updates?: any
  count?: number
}

// 历史记录详情更新信息（用于详情页实时刷新）
export interface HistoryDetailUpdate {
  record_id: string
  status?: string
  progress?: number
  logs?: any[]
  [key: string]: any
}

// 历史记录详情日志步骤
export interface HistoryDetailLogStep {
  name: string
  completed: boolean
  logs: Array<{ level: string; message: string }>
}

// 事件处理器类型
export type MessageHandler = (msg: WSMessage) => void
