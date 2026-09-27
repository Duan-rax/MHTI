<template>
  <div class="login">
    <!-- 左侧品牌区：说明这是什么产品。窄屏隐藏，避免把表单挤到屏幕下半部分 -->
    <aside class="brand">
      <div class="brand-top">
        <span class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M5 12.5L10 17.5L19 7"
              stroke="currentColor"
              stroke-width="2.4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
        <span class="brand-name">MHTI</span>
      </div>

      <div class="brand-copy">
        <h2 class="brand-title">媒体库刮削与整理</h2>
        <p class="brand-desc">
          从 TMDB 获取剧集元数据，按模板整理、重命名并生成 NFO 与图片。
          支持本地目录与 115 网盘，可接入 Emby。
        </p>
      </div>

      <p class="brand-foot">115 网盘 · Emby · 目录监控</p>
    </aside>

    <!-- 右侧表单区 -->
    <main class="panel">
      <div class="panel-inner">
        <header class="panel-head">
          <h1 class="panel-title">{{ isRegisterMode ? '创建管理员账号' : '欢迎回来' }}</h1>
          <p class="panel-subtitle">
            {{ isRegisterMode ? '首次使用，请设置管理员账号与密码' : '登录以继续管理你的媒体库' }}
          </p>
        </header>

        <div v-if="checking" class="panel-loading">
          <NSpin size="small" />
          <span>正在检查登录状态…</span>
        </div>

        <LoginFormPanel
          v-else
          ref="formRef"
          :is-register-mode="isRegisterMode"
          :loading="loading"
          :login-form="loginForm"
          :register-form="registerForm"
          :login-rules="loginRules"
          :register-rules="registerRules"
          :expire-options="expireOptions"
          @login="handleLogin"
          @register="handleRegister"
        />
      </div>

      <!-- 主题切换：不参与版面，固定在右下角 -->
      <NButton
        quaternary
        circle
        class="theme-toggle"
        :aria-label="isDark ? '切换到亮色模式' : '切换到暗色模式'"
        @click="toggleTheme"
      >
        <template #icon>
          <NIcon :component="isDark ? SunnyOutline : MoonOutline" :size="17" />
        </template>
      </NButton>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NButton, NIcon, NSpin } from 'naive-ui'
import { SunnyOutline, MoonOutline } from '@vicons/ionicons5'
import { useLogin } from '@/modules/auth/hooks/useLogin'
import type { LoginFormExposed } from '@/modules/auth/hooks/useLogin'
import { useTheme } from '@/shared/composables/useTheme'
import { expireOptions as expireOptionsData } from '@/modules/auth/api'
import LoginFormPanel from '@/modules/auth/components/LoginFormPanel.vue'

// 登录表单实例：模板 ref 绑定到 LoginFormPanel（其 defineExpose 上抛 validate），
// 由 useLogin 在提交前调用——原实现从未绑定，校验恒为空转
const formRef = ref<LoginFormExposed | null>(null)

const {
  loginForm,
  registerForm,
  loginRules,
  registerRules,
  loading,
  isRegisterMode,
  checking,
  handleLogin,
  handleRegister,
} = useLogin(formRef)

const { isDark, toggleTheme } = useTheme()
const expireOptions = expireOptionsData
</script>

<style scoped>
/*
 * 版面：左右分栏。
 * 旧实现是"垂直水平双居中 + 400px 卡片 + 24px 圆角 + 重投影 + 上滑入场"，
 * 属于典型的模板式登录页：卡片占满视觉中心却没有承载更多信息。
 * 现在把左侧让给产品说明，表单落在右侧 420px 的舒适阅读宽度上，
 * 整页无卡片、无阴影、无入场动画。
 */
.login {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  min-height: 100vh;
  background: var(--bg-surface);
}

/* -------------------- 左侧品牌区 -------------------- */
.brand {
  display: flex;
  flex-direction: column;
  padding: var(--space-12) var(--space-10);
  background: var(--bg-subtle);
  border-right: 1px solid var(--border-1);
}

.brand-top {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  background: var(--brand-500);
  color: var(--text-on-brand);
}

.brand-mark svg {
  width: 17px;
  height: 17px;
}

.brand-name {
  font-size: var(--text-md);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.02em;
  color: var(--text-1);
}

.brand-copy {
  margin: auto 0;
  max-width: 400px;
}

.brand-title {
  font-size: var(--text-2xl);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-snug);
  letter-spacing: var(--tracking-tight);
  color: var(--text-1);
}

.brand-desc {
  margin-top: var(--space-4);
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: var(--text-2);
}

.brand-foot {
  font-size: var(--text-sm);
  color: var(--text-3);
}

/* -------------------- 右侧表单区 -------------------- */
.panel {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-10) var(--space-6);
}

.panel-inner {
  width: 100%;
  max-width: 360px;
}

.panel-head {
  margin-bottom: var(--space-6);
}

.panel-title {
  font-size: var(--text-xl);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-snug);
  letter-spacing: var(--tracking-tight);
  color: var(--text-1);
}

.panel-subtitle {
  margin-top: var(--space-2);
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
  color: var(--text-2);
}

.panel-loading {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-8) 0;
  font-size: var(--text-sm);
  color: var(--text-2);
}

.theme-toggle {
  position: absolute;
  right: var(--space-5);
  bottom: var(--space-5);
}

/* -------------------- 窄屏：单列，隐藏品牌区 -------------------- */
@media (max-width: 899px) {
  .login {
    grid-template-columns: minmax(0, 1fr);
  }

  .brand {
    display: none;
  }

  .panel {
    align-items: flex-start;
    padding: calc(var(--space-16) + env(safe-area-inset-top, 0px)) var(--space-5) var(--space-10);
  }

  .panel-title {
    font-size: var(--text-lg);
  }
}
</style>
