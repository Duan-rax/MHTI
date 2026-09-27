<script setup lang="ts">
/**
 * CommandPalette — 全局命令面板（⌘K / Ctrl+K）
 *
 * 两种能力：
 *   1. 跳转 — 由路由 meta 派生（含 meta.menu=false 的隐藏页，这正是面板的价值）
 *   2. 动作 — 由父级通过 actions 传入，选中后经 run 事件回抛执行
 *
 * 键盘：↑/↓ 移动、Enter 执行、Esc 关闭；打开后自动聚焦输入框。
 * 组件自身只负责检索与交互，不直接产生业务副作用。
 */
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { NIcon } from 'naive-ui'
import { ArrowForwardOutline, SearchOutline } from '@vicons/ionicons5'
import { buildCommandEntries } from '@/router/menu'
import type { CommandAction } from './types'

const props = withDefaults(
  defineProps<{
    show: boolean
    actions?: CommandAction[]
  }>(),
  { actions: () => [] },
)

const emit = defineEmits<{
  'update:show': [value: boolean]
  /** 选中动作项 */
  run: [key: string]
}>()

const router = useRouter()
const keyword = ref('')
const activeIndex = ref(0)
const inputRef = ref<HTMLInputElement | null>(null)
const listRef = ref<HTMLElement | null>(null)

interface PaletteItem {
  key: string
  label: string
  hint?: string
  group: string
  /** 命中的检索文本 */
  haystack: string
}

/** 可跳转页面（含隐藏页） */
const routeItems = computed<PaletteItem[]>(() =>
  buildCommandEntries().map((entry) => ({
    key: `route:${entry.path}`,
    label: entry.title,
    hint: entry.subtitle,
    group: '跳转',
    haystack: [entry.title, entry.subtitle, entry.path, ...(entry.keywords ?? [])]
      .filter(Boolean)
      .join(' ')
      .toLowerCase(),
  })),
)

/** 动作项 */
const actionItems = computed<PaletteItem[]>(() =>
  props.actions.map((action) => ({
    key: `action:${action.key}`,
    label: action.label,
    hint: action.hint,
    group: '操作',
    haystack: [action.label, action.hint, ...(action.keywords ?? [])]
      .filter(Boolean)
      .join(' ')
      .toLowerCase(),
  })),
)

/**
 * 检索：空关键词返回全部；否则按包含匹配过滤。
 * 用"连续子串"而非模糊打分，是因为本产品条目数量有限，可预期性比"聪明"更重要。
 */
const filtered = computed<PaletteItem[]>(() => {
  const all = [...routeItems.value, ...actionItems.value]
  const q = keyword.value.trim().toLowerCase()
  if (!q) return all
  return all.filter((item) => item.haystack.includes(q))
})

/** 按 group 分组，保持原有顺序 */
const grouped = computed(() => {
  const groups: { name: string; items: PaletteItem[] }[] = []
  for (const item of filtered.value) {
    const last = groups[groups.length - 1]
    if (last && last.name === item.group) last.items.push(item)
    else groups.push({ name: item.group, items: [item] })
  }
  return groups
})

function close() {
  emit('update:show', false)
}

function runItem(item: PaletteItem) {
  close()
  if (item.key.startsWith('route:')) {
    router.push(item.key.slice('route:'.length))
    return
  }
  emit('run', item.key.slice('action:'.length))
}

function move(step: number) {
  const total = filtered.value.length
  if (total === 0) return
  activeIndex.value = (activeIndex.value + step + total) % total
  // 保持高亮项在可视区内
  nextTick(() => {
    listRef.value?.querySelector('.cmdk-item.is-active')?.scrollIntoView({ block: 'nearest' })
  })
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    move(1)
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    move(-1)
  } else if (event.key === 'Enter') {
    event.preventDefault()
    const item = filtered.value[activeIndex.value]
    if (item) runItem(item)
  } else if (event.key === 'Escape') {
    event.preventDefault()
    close()
  }
}

/** 全局快捷键：⌘K / Ctrl+K 开关面板 */
function handleGlobalKeydown(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    emit('update:show', !props.show)
  }
}

// 每次打开重置检索与高亮，避免上次搜索残留
watch(
  () => props.show,
  (show) => {
    if (!show) return
    keyword.value = ''
    activeIndex.value = 0
    nextTick(() => {
      inputRef.value?.focus()
    })
  },
)

// 检索结果变化时高亮回到首项，避免越界
watch(filtered, () => {
  activeIndex.value = 0
})

onMounted(() => window.addEventListener('keydown', handleGlobalKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleGlobalKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition name="cmdk">
      <div v-if="show" class="cmdk-mask" @click.self="close">
        <div
          class="cmdk-panel"
          role="dialog"
          aria-modal="true"
          aria-label="搜索与跳转"
          @keydown="handleKeydown"
        >
          <div class="cmdk-input-row">
            <NIcon :component="SearchOutline" :size="16" class="cmdk-input-icon" />
            <input
              ref="inputRef"
              v-model="keyword"
              class="cmdk-input"
              type="text"
              placeholder="搜索页面或执行操作…"
              autocomplete="off"
              spellcheck="false"
            />
            <kbd class="cmdk-esc">Esc</kbd>
          </div>

          <div ref="listRef" class="cmdk-list">
            <template v-if="filtered.length">
              <template v-for="group in grouped" :key="group.name">
                <p class="cmdk-group">{{ group.name }}</p>
                <button
                  v-for="item in group.items"
                  :key="item.key"
                  type="button"
                  class="cmdk-item"
                  :class="{ 'is-active': filtered[activeIndex]?.key === item.key }"
                  @mouseenter="activeIndex = filtered.indexOf(item)"
                  @click="runItem(item)"
                >
                  <span class="cmdk-item-label">{{ item.label }}</span>
                  <span v-if="item.hint" class="cmdk-item-hint">{{ item.hint }}</span>
                  <NIcon :component="ArrowForwardOutline" :size="14" class="cmdk-item-arrow" />
                </button>
              </template>
            </template>
            <p v-else class="cmdk-empty">没有匹配的页面或操作</p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.cmdk-mask {
  position: fixed;
  inset: 0;
  /* 命令面板是全局浮层，必须盖住 naive 弹窗（其内部阶梯从 2000 起） */
  z-index: var(--z-above-naive);
  display: flex;
  /* 面板高度自适应内容：不加 flex-start 会被拉伸到遮罩全高 */
  align-items: flex-start;
  justify-content: center;
  /* 偏上放置：视线自然落点，不被输入法/底栏遮挡 */
  padding: 12vh var(--space-4) var(--space-4);
  background: color-mix(in srgb, var(--text-1) 24%, transparent);
}

.cmdk-panel {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 520px;
  max-height: 60vh;
  overflow: hidden;
  background: var(--bg-surface);
  border: 1px solid var(--border-1);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
}

/* -------------------- 输入行 -------------------- */
.cmdk-input-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 0 var(--space-4);
  height: 48px;
  border-bottom: 1px solid var(--border-1);
}

.cmdk-input-icon {
  color: var(--text-3);
  flex-shrink: 0;
}

.cmdk-input {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-family: inherit;
  font-size: var(--text-md);
  color: var(--text-1);
}

.cmdk-input::placeholder {
  color: var(--text-3);
}

.cmdk-esc {
  padding: 2px 6px;
  border: 1px solid var(--border-1);
  border-radius: var(--radius-xs);
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-3);
}

/* -------------------- 列表 -------------------- */
.cmdk-list {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-2);
}

.cmdk-group {
  padding: var(--space-2) var(--space-3) var(--space-1);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.06em;
  color: var(--text-3);
}

.cmdk-item {
  display: flex;
  align-items: baseline;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  text-align: left;
  font-family: inherit;
  cursor: pointer;
}

/* 键盘高亮与鼠标悬停同一视觉，避免两套状态 */
.cmdk-item.is-active {
  background: var(--bg-hover);
}

.cmdk-item-label {
  font-size: var(--text-base);
  font-weight: var(--weight-medium);
  color: var(--text-1);
  flex-shrink: 0;
}

.cmdk-item-hint {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--text-sm);
  color: var(--text-3);
}

.cmdk-item-arrow {
  margin-left: auto;
  align-self: center;
  color: var(--text-3);
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-in-out);
}

.cmdk-item.is-active .cmdk-item-arrow {
  opacity: 1;
}

.cmdk-empty {
  padding: var(--space-8) 0;
  text-align: center;
  font-size: var(--text-sm);
  color: var(--text-2);
}

/* -------------------- 进场动效（仅位移 4px，够用不喧哗） -------------------- */
.cmdk-enter-active,
.cmdk-leave-active {
  transition: opacity var(--duration-normal) var(--ease-out);
}

.cmdk-enter-active .cmdk-panel,
.cmdk-leave-active .cmdk-panel {
  transition: transform var(--duration-normal) var(--ease-out);
}

.cmdk-enter-from,
.cmdk-leave-to {
  opacity: 0;
}

.cmdk-enter-from .cmdk-panel,
.cmdk-leave-to .cmdk-panel {
  transform: translateY(-4px) scale(0.99);
}
</style>
