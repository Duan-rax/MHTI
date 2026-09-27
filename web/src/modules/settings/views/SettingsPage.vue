<script setup lang="ts">
/**
 * SettingsPage — 设置
 *
 * 布局：左侧分组导航 + 右侧内容（后台系统的标准范式）。横排 Tab 在 1280 内容宽内
 * 会溢出（原先最后一个 Tab 被裁掉），设置项天然适合纵向罗列，扫读与点击都更省力。
 *
 * 三个细节：
 * 1. 懒挂载 + 保持挂载：某个分组首次访问才挂载，之后用 v-show 保留。原生 NTabPane
 *    默认 displayDirective: 'if' 会卸载非激活内容，导致"填了一半切走再切回，输入丢失"
 *    （CLAUDE.md 已知陷阱 #6）。
 * 2. 表单内容限宽 720px：设置项多是路径/开关/短输入，拉满 1280 只会让 label 与 input
 *    相隔半屏，视线来回横跳。
 * 3. 每个分组有固定标题与一句话说明（内容区唯一 h2）：说明写在导航与卡片之间，
 *    用户不用展开卡片就知道这一组管什么。
 *
 * 分组元数据（key/标题/说明/是否宽面板）在 constants.ts，本文件只管装配与切换。
 *
 * 页头放在左列：受 1280 内容宽限制，页头单独占一行时左列顶部会空出一段
 * （导航第一项比右列标题低 ~62px）。把「设置 / 配置应用参数」放进左列导航上方，
 * 两列顶部就落在同一条水平线上，内容整体上移一屏。这里因此不使用 PageContainer
 * 的默认页头（它把标题固定在页面最上方），但标题与副标题仍取自路由 meta
 * （router/shell.ts 仍是真源），与 HistoryDetailPage 自绘页头同一做法。
 */
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import SettingsPanes from '@/modules/settings/components/SettingsPanes.vue'
import {
  groupSettingsSections,
  SETTINGS_SECTIONS,
  type SectionKey,
} from '@/modules/settings/constants'

const route = useRoute()

/** 页头文案取自路由 meta（真源 router/shell.ts），与 PageContainer 取值方式一致 */
const pageTitle = computed(() => String(route.meta.title ?? ''))
const pageSubtitle = computed(() => String(route.meta.subtitle ?? ''))

const active = ref<SectionKey>('organize')

/** 访问过的分组才挂载，之后保持挂载以保留未提交的表单输入 */
const mounted = ref<Set<SectionKey>>(new Set(['organize']))

function select(key: SectionKey) {
  active.value = key
  mounted.value.add(key)
}

const activeSection = computed(
  () => SETTINGS_SECTIONS.find((section) => section.key === active.value) ?? SETTINGS_SECTIONS[0]!,
)

const groups = computed(() => groupSettingsSections())
</script>

<template>
  <div class="settings">
    <!-- 左列：页头 + 分组导航（桌面竖列，移动端转顶部横向滚动） -->
    <div class="settings-side">
      <header class="side-head">
        <h1 class="side-title">{{ pageTitle }}</h1>
        <p v-if="pageSubtitle" class="side-subtitle">{{ pageSubtitle }}</p>
      </header>

      <nav class="settings-nav" aria-label="设置分组">
        <template v-for="(group, index) in groups" :key="index">
          <p v-if="group.title" class="nav-group">{{ group.title }}</p>
          <button
            v-for="section in group.items"
            :key="section.key"
            type="button"
            class="nav-item"
            :class="{ 'is-active': active === section.key }"
            :aria-current="active === section.key ? 'true' : undefined"
            @click="select(section.key)"
          >
            {{ section.label }}
          </button>
        </template>
      </nav>
    </div>

      <div class="settings-body" :class="{ 'is-wide': activeSection.wide }">
        <header class="pane-head">
          <h2 class="pane-title">{{ activeSection.label }}</h2>
          <p class="pane-desc">{{ activeSection.description }}</p>
        </header>

        <SettingsPanes :active="active" :mounted="mounted" />
      </div>
    </div>
</template>

<style scoped>
.settings {
  display: grid;
  grid-template-columns: 176px minmax(0, 1fr);
  gap: var(--space-8);
  align-items: start;
}

/* -------------------- 左列：页头 + 导航 -------------------- */
.settings-side {
  /* 拉满行高，sticky 导航才有行程可吸附（否则只能粘到本列高度为止） */
  align-self: stretch;
  display: flex;
  flex-direction: column;
}

.side-head {
  padding-bottom: var(--space-4);
  margin-bottom: var(--space-4);
  border-bottom: 1px solid var(--border-1);
}

.side-title {
  font-size: var(--text-xl);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-snug);
  letter-spacing: var(--tracking-tight);
  color: var(--text-1);
}

.side-subtitle {
  margin-top: var(--space-1);
  font-size: var(--text-sm);
  line-height: var(--leading-snug);
  color: var(--text-2);
}

/* -------------------- 左侧导航 -------------------- */
.settings-nav {
  position: sticky;
  top: calc(var(--shell-header-h) + var(--space-6));
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.nav-group {
  margin-top: var(--space-5);
  margin-bottom: var(--space-2);
  padding-left: var(--space-3);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.06em;
  /* 12px 小字用 --text-2：--text-3 对页面底色只有 3.5:1，低于 WCAG AA */
  color: var(--text-2);
}

.nav-group:first-child {
  margin-top: 0;
}

.nav-item {
  padding: var(--space-2) var(--space-3);
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  text-align: left;
  font-family: inherit;
  font-size: var(--text-base);
  color: var(--text-2);
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-in-out),
    color var(--duration-fast) var(--ease-in-out);
}

.nav-item:hover {
  background: var(--bg-hover);
  color: var(--text-1);
}

/* 激活态：浅底 + 主色文字 + 左侧指示条，三处同时变化，不会与 hover 混淆 */
.nav-item.is-active {
  position: relative;
  background: var(--brand-50);
  color: var(--brand-600);
  font-weight: var(--weight-medium);
}

.nav-item.is-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 20%;
  bottom: 20%;
  width: 2px;
  border-radius: var(--radius-full);
  background: var(--brand-500);
}

/* -------------------- 内容区 -------------------- */
.settings-body {
  min-width: 0;
  max-width: 720px;
}

/* 表格型分组（日志）：720 放不下四列，放宽但仍留出行长上限 */
.settings-body.is-wide {
  max-width: 1120px;
}

/* 标题与说明并排：两行标题块会把卡片往下推 24px，并排后一行说清这一组管什么 */
.pane-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--space-1) var(--space-3);
  margin-bottom: var(--space-4);
}

.pane-title {
  margin: 0;
  font-size: var(--text-xl);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-snug);
  color: var(--text-1);
}

.pane-desc {
  margin: 0;
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
  color: var(--text-2);
}

/* -------------------- 移动端：导航转为顶部横向滚动 -------------------- */
@media (max-width: 1023px) {
  .settings {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-4);
  }

  .settings-nav {
    position: static;
    flex-direction: row;
    gap: var(--space-1);
    overflow-x: auto;
    padding-bottom: var(--space-2);
    border-bottom: 1px solid var(--border-1);
    scrollbar-width: none;
  }

  .settings-nav::-webkit-scrollbar {
    display: none;
  }

  .nav-group {
    display: none;
  }

  .nav-item {
    flex-shrink: 0;
    white-space: nowrap;
  }

  .nav-item.is-active::before {
    top: auto;
    bottom: 0;
    left: var(--space-2);
    right: var(--space-2);
    width: auto;
    height: 2px;
  }

  /* 移动端：页头仍在最上方，导航变横向行，去掉与横向导航重复的分隔线 */
  .side-head {
    padding-bottom: var(--space-3);
    margin-bottom: var(--space-3);
    border-bottom: none;
  }

  .pane-title {
    font-size: var(--text-lg);
  }
}
</style>
