<script setup lang="ts">
/**
 * 路径导航（FilesPage 卡片头部）
 *
 * 返回上级 + 根目录/路径分段 + provider 标记。纯展示：路径状态与导航动作
 * 由父组件持有（契约与重构前一致：parentPath / currentPath / currentProvider /
 * pathSegments 入参，up / root / path 出参）。
 *
 * 视觉取舍：
 * - 不再用自带底色与圆角的横条：它是卡片的头部，再铺一层底色等于在卡里画
 *   第二张卡，改由页面的卡片框架承担边界。
 * - 分段由 naive 面包屑改为真正的 <button>：naive 的面包屑项是 div + click，
 *   键盘不可达，而文件浏览是深路径场景，"Tab 着往回跳"是刚需。
 * - provider 标记由实心 NTag 改为 StatusBadge：语义色浅底 + 图标，与全站状态
 *   表达一致，也避免一屏出现彩色胶囊。
 */
import { onMounted, ref, watch } from 'vue'
import { NButton, NIcon } from 'naive-ui'
import { ArrowBackOutline, CloudOutline } from '@vicons/ionicons5'
import type { StorageProvider } from '@/shared/types/common'
import StatusBadge from '@/shared/components/business/StatusBadge.vue'

const props = defineProps<{
  parentPath: string | null
  currentPath: string
  currentProvider: StorageProvider
  pathSegments: { name: string; path: string }[]
}>()

const trail = ref<HTMLElement | null>(null)

const emit = defineEmits<{
  up: []
  root: []
  path: [path: string]
}>()

/** 路径变深后把导航条滚到最右：否则当前目录停在可视区之外（窄屏必然发生） */
const scrollToEnd = () => {
  const el = trail.value
  if (el) el.scrollLeft = el.scrollWidth
}

/* 必须 flush: 'post'：默认的 pre 会在子组件重新渲染之前跑，那时导航条里还是旧
 * 的分段、scrollWidth 也还没溢出，赋值会被钳到 0（实测 deep-link 首次进入时
 * 当前目录出屏）。post 保证 DOM 已更新，量到的 scrollWidth 才是真的。 */
watch(() => props.currentPath, scrollToEnd, { flush: 'post' })

onMounted(scrollToEnd)
</script>

<template>
  <div class="path-bar">
    <NButton
      quaternary
      circle
      size="small"
      :disabled="parentPath === null && !currentPath && currentProvider !== '115'"
      aria-label="返回上级目录"
      @click="emit('up')"
    >
      <template #icon>
        <NIcon :component="ArrowBackOutline" />
      </template>
    </NButton>

    <nav ref="trail" class="path-trail" aria-label="当前路径">
      <button
        type="button"
        class="path-seg"
        :class="{ 'is-current': pathSegments.length === 0 }"
        :aria-current="pathSegments.length === 0 ? 'location' : undefined"
        @click="emit('root')"
      >
        根目录
      </button>
      <template v-for="(segment, index) in pathSegments" :key="segment.path">
        <span class="path-sep" aria-hidden="true">/</span>
        <button
          type="button"
          class="path-seg"
          :class="{ 'is-current': index === pathSegments.length - 1 }"
          :aria-current="index === pathSegments.length - 1 ? 'location' : undefined"
          :title="segment.path"
          @click="emit('path', segment.path)"
        >
          {{ segment.name }}
        </button>
      </template>
    </nav>

    <StatusBadge
      v-if="currentProvider === '115'"
      status="info"
      size="small"
      :round="false"
      :icon="CloudOutline"
      text="115 网盘"
      class="provider"
    />
  </div>
</template>

<style scoped>
.path-bar {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
}

/* 导航条：不折行，横向可滚，滚动条隐藏——
 * 一行路径折成两行会顶掉下方工具行；纵向 padding 给焦点环留出空间，
 * 否则 overflow 会把它裁掉。 */
.path-trail {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  padding-block: var(--space-1);
  overflow-x: auto;
  scrollbar-width: none;
}

.path-trail::-webkit-scrollbar {
  display: none;
}

.path-seg {
  flex-shrink: 0;
  padding: 2px var(--space-2);
  border: none;
  border-radius: var(--radius-xs);
  background: none;
  font-family: inherit;
  font-size: var(--text-sm);
  line-height: var(--leading-snug);
  color: var(--text-2);
  white-space: nowrap;
  cursor: pointer;
  transition:
    color var(--duration-fast) var(--ease-in-out),
    background-color var(--duration-fast) var(--ease-in-out);
}

.path-seg:hover {
  background: var(--bg-hover);
  color: var(--text-1);
}

/* 当前所在层级：颜色与字重抬起来，一眼知道"我在哪"（不靠色块标记） */
.path-seg.is-current {
  color: var(--text-1);
  font-weight: var(--weight-medium);
}

.path-sep {
  flex-shrink: 0;
  font-size: var(--text-xs);
  color: var(--text-3);
  user-select: none;
}

.provider {
  flex-shrink: 0;
}
</style>
