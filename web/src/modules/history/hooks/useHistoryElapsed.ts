import { onScopeDispose, ref, watch, type Ref } from 'vue'

/**
 * 刮削记录「耗时实时跳动」时钟。
 *
 * 只在存在 running 记录时才起 1s 定时器：终态记录的耗时是定值，
 * 无事可做时不该让整个列表每秒重渲染一次。
 *
 * isActive 是响应式取值函数（页面侧写 `() => records.value.some(...)`），
 * 记录跑完落终态时定时器会自动停掉；组件卸载同样会清理。
 */
export function useElapsedClock(isActive: () => boolean): Ref<number> {
  // 初值取当前时间：首帧就按 started_at 算出已耗时，不会先闪一个 0
  const nowMs = ref(Date.now())
  let timer: number | null = null

  const stop = () => {
    if (timer !== null) {
      window.clearInterval(timer)
      timer = null
    }
  }

  watch(
    isActive,
    (active) => {
      if (!active) {
        stop()
        return
      }
      // 立刻对齐一次，避免最多 1s 的显示滞后
      nowMs.value = Date.now()
      if (timer === null) {
        timer = window.setInterval(() => {
          nowMs.value = Date.now()
        }, 1000)
      }
    },
    { immediate: true },
  )

  onScopeDispose(stop)

  return nowMs
}
