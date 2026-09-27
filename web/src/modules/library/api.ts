import api from '@/shared/api/client'
import type { ScanRequest, ScanResponse } from '@/modules/library/types'

/**
 * 文件相关 API
 *
 * 目录浏览走 shared/api/fs.ts 的 fsApi.browse——该接口被 FolderBrowser
 * 等跨域基础设施消费，与原 filesApi.browse 是同一实现的重复副本，
 * 此处仅保留 library 域私有的扫描接口。
 */
export const filesApi = {
  /**
   * 扫描目录中的视频文件
   * @param folderPath 要扫描的目录路径
   * @param excludeScraped 是否排除已刮削的文件，默认 true
   * @param locator 存储定位信息（115 等云端目录需要）
   */
  async scan(
    folderPath: string,
    excludeScraped: boolean = true,
    locator?: ScanRequest['locator'],
  ): Promise<ScanResponse> {
    const request: ScanRequest = {
      folder_path: folderPath,
      exclude_scraped: excludeScraped,
      locator: locator ?? null,
    }
    const response = await api.post<ScanResponse>('/scan', request)
    return response.data
  },
}
