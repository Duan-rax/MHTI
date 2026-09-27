<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NIcon, NPagination, useMessage, type DataTableRowKey } from 'naive-ui'
import { SwapHorizontalOutline } from '@vicons/ionicons5'
import type { DirectoryEntry, StorageLocator } from '@/shared/types/common'
import { useDirectoryBrowser } from '@/modules/library/hooks/useDirectoryBrowser'
import { ManualJobCreateModal } from '@/modules/scrape'
import EmptyState from '@/shared/components/base/EmptyState.vue'
import PageContainer from '@/shared/components/base/PageContainer.vue'
import PageSkeleton from '@/shared/components/base/PageSkeleton.vue'
import FileBreadcrumb from '@/modules/library/components/FileBreadcrumb.vue'
import FileMobileCard from '@/modules/library/components/FileMobileCard.vue'
import FilesTable from '@/modules/library/components/FilesTable.vue'
import FilesToolbar from '@/modules/library/components/FilesToolbar.vue'
import { useMobileLayout } from '@/shared/composables/useMobileLayout'

const router = useRouter()
const message = useMessage()
const { isMobile } = useMobileLayout()

// 目录浏览（加载/导航/面包屑/过滤/分页）
const {
  loading,
  entries,
  currentPath,
  parentPath,
  total,
  page,
  pageSize,
  search,
  checkedRowKeys,
  currentProvider,
  currentFileId,
  filteredEntries,
  pathSegments,
  enterDirectory,
  prefetchDirectory,
  goUp,
  goToPath,
  goToRoot,
  handlePageChange,
  buildLocatorFor,
} = useDirectoryBrowser()

// 首屏加载：还没有任何条目时用骨架代替整张卡，避免"先出空卡再填内容"的跳动
const firstLoad = computed(() => loading.value && entries.value.length === 0)

// 有过滤条件却没结果 ≠ 目录为空，两者给的下一步动作不同
const hasSearch = computed(() => search.value !== '')

const clearSearch = () => {
  search.value = ''
}

// 建任务弹窗
const showCreateModal = ref(false)
const createTaskPath = ref('')
const createTaskLocator = ref<StorageLocator | null>(null)

const createTaskForFolder = (entry: DirectoryEntry) => {
  createTaskPath.value = entry.path
  createTaskLocator.value = buildLocatorFor(entry.path, entry.file_id)
  showCreateModal.value = true
}

const createTaskForSelected = () => {
  createTaskPath.value = currentPath.value
  createTaskLocator.value = buildLocatorFor(currentPath.value, currentFileId.value)
  showCreateModal.value = true
}

const handleCreateSuccess = () => {
  message.success('任务已创建')
}

const handleCheckedRowKeysChange = (keys: DataTableRowKey[]) => {
  checkedRowKeys.value = keys
}

// 模式切换（URL 与导航语义不变，只是从纯文字链接改为按钮）
const goToScanMode = () => {
  router.push('/filemanager/scan')
}
</script>

<template>
  <div class="files-page">
    <PageContainer>
      <!-- 标题由 PageContainer 取自路由 meta；此处只放模式切换入口 -->
      <template #actions>
        <NButton @click="goToScanMode">
          <template #icon>
            <NIcon :component="SwapHorizontalOutline" :size="16" />
          </template>
          扫描模式
        </NButton>
      </template>

      <!-- 首屏骨架直接顶替整张卡（骨架自带卡片外框），内容到位后再换成真卡 -->
      <PageSkeleton
        v-if="firstLoad"
        :preset="isMobile ? 'list' : 'table'"
        :count="6"
        :show-header="false"
      />

      <!-- 单卡框架：卡头路径 → 工具行 → 内容 → 卡脚分页，一条纵向阅读顺序 -->
      <div v-else class="browser">
        <div class="browser-head">
          <FileBreadcrumb
            :parent-path="parentPath"
            :current-path="currentPath"
            :current-provider="currentProvider"
            :path-segments="pathSegments"
            @up="goUp"
            @root="goToRoot"
            @path="goToPath"
          />
        </div>

        <div class="browser-tools">
          <FilesToolbar
            v-model="search"
            :checked-count="checkedRowKeys.length"
            :current-path="currentPath"
            @create="createTaskForSelected"
          />
        </div>

        <div class="browser-body">
          <!-- 移动端：卡内平铺的行，行间发丝分隔线 -->
          <div v-if="isMobile && filteredEntries.length > 0" class="row-list">
            <FileMobileCard
              v-for="entry in filteredEntries"
              :key="entry.path"
              :entry="entry"
              @open="(e) => e.is_dir ? enterDirectory(e) : undefined"
              @create="createTaskForFolder"
            />
          </div>

          <!-- 桌面端：表格外框由卡片承担，故表格自身不带描边 -->
          <FilesTable
            v-else-if="!isMobile && filteredEntries.length > 0"
            :entries="filteredEntries"
            :loading="loading"
            :checked-row-keys="checkedRowKeys"
            @update:checked-row-keys="handleCheckedRowKeysChange"
            @enter="enterDirectory"
            @create="createTaskForFolder"
            @hover="prefetchDirectory"
          />

          <EmptyState
            v-else
            :icon="hasSearch ? 'search' : 'empty'"
            :title="hasSearch ? '没有匹配的条目' : '目录为空'"
            :description="
              hasSearch
                ? `当前目录里没有名称包含「${search}」的条目`
                : '当前目录没有文件或文件夹'
            "
            :action-text="hasSearch ? '清除过滤' : undefined"
            @action="clearSearch"
          />
        </div>

        <footer v-if="total > pageSize" class="browser-foot">
          <span class="foot-total tabular">共 {{ total.toLocaleString('zh-CN') }} 项</span>
          <NPagination
            v-model:page="page"
            :page-size="pageSize"
            :item-count="total"
            @update:page="handlePageChange"
          />
        </footer>
      </div>
    </PageContainer>

    <!-- 创建任务弹窗 -->
    <ManualJobCreateModal
      v-model:show="showCreateModal"
      :initial-scan-path="createTaskPath"
      :initial-scan-locator="createTaskLocator"
      @success="handleCreateSuccess"
    />
  </div>
</template>

<style scoped>
/* -------------------- 卡片框架 -------------------- */
.browser {
  overflow: hidden;
  background: var(--bg-surface);
  border: 1px solid var(--border-1);
  border-radius: var(--radius-lg);
}

.browser-head {
  padding: var(--space-4) var(--space-5) var(--space-3);
}

.browser-tools {
  padding: 0 var(--space-5) var(--space-4);
}

/* 内容区与工具行之间一条发丝线：表头底色很淡，没有它两段会连成一片 */
.browser-body {
  border-top: 1px solid var(--border-1);
}

.browser-foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-5);
  border-top: 1px solid var(--border-1);
}

.foot-total {
  font-size: var(--text-xs);
  color: var(--text-2);
}

/* -------------------- 移动端行列表 --------------------
 * 行的描边与圆角在这里归零：行落在卡片里，自带边界就是卡中卡；
 * 层级由行间的发丝线划分（:deep 提高特异性以压过 TouchCard 自身样式）。 */
.row-list :deep(div.file-card) {
  border: 0;
  border-radius: 0;
}

.row-list :deep(div.file-card + div.file-card) {
  border-top: 1px solid var(--border-1);
}

/* -------------------- 窄屏 -------------------- */
@media (max-width: 767px) {
  .browser-head {
    padding: var(--space-3) var(--space-4) var(--space-2);
  }

  .browser-tools {
    padding: 0 var(--space-4) var(--space-3);
  }

  .browser-foot {
    justify-content: flex-end;
  }
}
</style>
