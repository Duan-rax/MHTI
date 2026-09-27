<script setup lang="ts">
/**
 * TMDB 配置向导 - 步骤 1（获取 Token 引导）
 *
 * 三步图文引导 + 提示框。外链经 open 事件上抛（window.open 由父组件执行）。
 * .intro-* 与 .tip-alert 样式在本组件与 TokenVerifyStep 各留一份——
 * 两页共用同名类，父组件 scoped 属性不作用于子组件内部。
 */
import { NAlert, NButton, NIcon } from 'naive-ui'
import { AlertCircleOutline, KeyOutline, OpenOutline } from '@vicons/ionicons5'

const emit = defineEmits<{
  open: [url: string]
}>()

// TMDB 注册和 API 页面链接
const TMDB_SIGNUP_URL = 'https://www.themoviedb.org/signup'
const TMDB_API_URL = 'https://www.themoviedb.org/settings/api'
</script>

<template>
  <div class="step-content">
    <div class="intro-section">
      <NIcon
        :component="KeyOutline"
        :size="40"
        color="var(--brand-500)"
        class="intro-icon"
      />
      <h3 class="intro-title">获取 TMDB API Token</h3>
      <p class="intro-desc">
        MHTI 使用 TMDB (The Movie Database) 获取剧集信息。<br>
        您需要一个免费的 API Token 才能开始使用。
      </p>
    </div>

    <div class="guide-steps">
      <div class="guide-step">
        <span class="step-number">1</span>
        <div class="step-content-inner">
          <span class="step-title">注册 TMDB 账号</span>
          <span class="step-desc">如果您还没有账号，请先注册</span>
          <NButton
            type="primary"
            size="small"
            @click="emit('open', TMDB_SIGNUP_URL)"
          >
            <template #icon>
              <NIcon :component="OpenOutline" />
            </template>
            前往注册
          </NButton>
        </div>
      </div>

      <div class="guide-step">
        <span class="step-number">2</span>
        <div class="step-content-inner">
          <span class="step-title">获取 API Token</span>
          <span class="step-desc">登录后进入 API 设置页面，复制 "API Read Access Token"</span>
          <NButton
            type="primary"
            size="small"
            @click="emit('open', TMDB_API_URL)"
          >
            <template #icon>
              <NIcon :component="OpenOutline" />
            </template>
            打开 API 设置
          </NButton>
        </div>
      </div>

      <div class="guide-step">
        <span class="step-number">3</span>
        <div class="step-content-inner">
          <span class="step-title">复制长字符串 Token</span>
          <span class="step-desc">
            找到 "API Read Access Token" 部分，复制以 "eyJ" 开头的长字符串
          </span>
        </div>
      </div>
    </div>

    <NAlert type="info" class="tip-alert">
      <template #icon>
        <NIcon :component="AlertCircleOutline" />
      </template>
      <strong>提示：</strong>请复制 "API Read Access Token"，而不是 "API Key"。<br>
      Token 通常以 "eyJ" 开头，是一个很长的字符串。
    </NAlert>
  </div>
</template>

<style scoped>
/* 入场动画与悬停位移都是项目禁项（CLAUDE.md §6）：这里只保留静态版式 */
.step-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

/* 介绍区域：去掉 88px 圆角色块，图标自身带品牌色即可 */
.intro-section {
  text-align: center;
}

/* 图标是行内元素，居中交给父容器的 text-align */
.intro-icon {
  display: inline-block;
  margin-bottom: var(--space-3);
}

.intro-title {
  margin: 0 0 var(--space-2);
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  color: var(--text-1);
}

.intro-desc {
  margin: 0;
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: var(--text-2);
}

/* 引导步骤：用左对齐的编号列表，不用卡片套卡片 */
.guide-steps {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.guide-step {
  display: flex;
  gap: var(--space-3);
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full);
  background: var(--bg-subtle);
  color: var(--text-2);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  font-variant-numeric: tabular-nums;
}

.step-content-inner {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-1);
}

.step-title {
  font-size: var(--text-base);
  font-weight: var(--weight-medium);
  color: var(--text-1);
}

.step-desc {
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
  color: var(--text-2);
}

/* 提示框 */
.tip-alert :deep(.n-alert__content) {
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
}
</style>