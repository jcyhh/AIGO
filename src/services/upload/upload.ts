import { isFlutterHost } from '../platform/runtime.ts'
import { uploadImageWithBrowser } from './browser.ts'
import { uploadImageWithFlutter } from './flutter.ts'
import type { UploadFileOptions, UploadResult } from './types.ts'

export function uploadImage(
    options: Omit<UploadFileOptions, 'file'> = {},
): Promise<UploadResult> {
    // TODO(upload): Connect shared loading and error feedback after the global feedback module is ready.
    // TODO(upload): 全局反馈系统完成后，在上传流程中统一接入 Loading 和错误提示。
    if (isFlutterHost()) return uploadImageWithFlutter()
    return uploadImageWithBrowser(options)
}
