<script setup lang="ts">
/**
 * 设置分组内的小节（settings 域私有版式件）
 *
 * 给「一张卡里还要再分几段」的面板用（下载、NFO、115、Emby）：
 * 小节标题 12px 半粗 + 可选一句话说明，比 NDivider 的分割线更轻，也不需要
 * 每段都套一张卡（卡中卡是明确要避免的）。
 */
defineProps<{
  title: string
  /** 一句话说明（可选） */
  hint?: string
}>()
</script>

<template>
  <section class="settings-group">
    <h3 class="group-title">{{ title }}</h3>
    <p v-if="hint" class="group-hint">{{ hint }}</p>
    <div class="group-body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.settings-group {
  display: flex;
  flex-direction: column;
}

.group-title {
  margin: 0;
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.04em;
  color: var(--text-2);
}

.group-hint {
  margin: var(--space-1) 0 0;
  font-size: var(--text-xs);
  line-height: var(--leading-normal);
  color: var(--text-2);
}

.group-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-top: var(--space-3);
}
</style>
