/**
 * 目录浏览接口（跨域基础设施）
 *
 * 被 shared/components/business/FolderBrowser(+Modal) 与多个业务域消费，
 * 故置于 shared/api 而非任一业务模块内（见 ARCHITECTURE.md 第 2 节 Api 层）。
 */

import api from '@/shared/api/client'
import type { BrowseResponse, StorageProvider } from '@/shared/types/common'

export const fsApi = {
  /**
   * 浏览目录
   *
   * @param path 目录路径，空字符串表示根目录
   * @param page 页码（从 1 开始）
   * @param pageSize 每页条目数
   * @param provider 存储提供方（local / 115），默认 local
   * @param fileId provider 文件 ID（115 用）
   */
  async browse(
    path: string = '',
    page: number = 1,
    pageSize: number = 20,
    provider?: StorageProvider,
    fileId?: string | null,
  ): Promise<BrowseResponse> {
    const response = await api.get<BrowseResponse>('/files/browse', {
      params: {
        path,
        page,
        page_size: pageSize,
        ...(provider ? { provider } : {}),
        ...(fileId ? { file_id: fileId } : {}),
      },
    })
    return response.data
  },
}