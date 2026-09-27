/**
 * 路由守卫链（见 ARCHITECTURE.md 第 4 节）
 *
 * 行为与重构前完全等价：
 * ① 设置文档标题 ② public 白名单放行 ③ 认证检查 ④ 未登录跳登录
 *
 * permission 位为占位（后端暂无权限模型），只做断言不拦截。
 */

import type { Router } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export function setupGuards(router: Router): void {
  router.beforeEach(async (to, _from, next) => {
    const title = to.meta.title
    document.title = title ? `${title} - MHTI` : 'MHTI'

    // 公开页面直接放行
    if (to.meta.public) {
      next()
      return
    }

    // 等待认证检查完成
    const authStore = useAuthStore()
    if (!authStore.isReady) {
      await authStore.checkAuth()
    }

    if (!authStore.isAuthenticated) {
      next({ name: 'login' })
      return
    }

    // permission 占位：当前后端无权限模型，仅断言存在性，不拦截
    // if (to.meta.permission && !authStore.hasPermission(to.meta.permission)) {
    //   next({ name: 'home' }); return
    // }

    next()
  })
}