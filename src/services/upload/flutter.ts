import { HTTP_UPLOAD_CONFIG } from '../http/config.ts'
import { postMessageToFlutter } from '../platform/flutterBridge.ts'
import { getToken } from '../storage/token.ts'
import type { UploadResult } from './types.ts'

const UPLOAD_RESULT_PREFIX = 'uploadImageUrl:'

let flutterUploadInProgress = false

export function uploadImageWithFlutter(): Promise<UploadResult> {
    if (flutterUploadInProgress) {
        return Promise.reject(new Error('Flutter 图片上传正在进行中'))
    }

    flutterUploadInProgress = true

    return new Promise((resolve, reject) => {
        const previousHandler = window.receiveMessageFromFlutter
        let settled = false

        const cleanup = () => {
            window.clearTimeout(timeoutId)
            if (window.receiveMessageFromFlutter === handleFlutterMessage) {
                window.receiveMessageFromFlutter = previousHandler
            }
            flutterUploadInProgress = false
        }

        const finish = (result: UploadResult) => {
            if (settled) return
            settled = true
            cleanup()
            resolve(result)
        }

        const fail = (error: unknown) => {
            if (settled) return
            settled = true
            cleanup()
            reject(error instanceof Error ? error : new Error(String(error)))
        }

        const handleFlutterMessage = (message: string) => {
            let previousHandlerError: unknown

            try {
                previousHandler?.(message)
            } catch (error) {
                previousHandlerError = error
            }

            if (message.startsWith(UPLOAD_RESULT_PREFIX)) {
                const url = message.slice(UPLOAD_RESULT_PREFIX.length).trim()
                if (url) finish({ url })
                else fail(new Error('Flutter 返回的上传地址为空'))
            }

            if (previousHandlerError) throw previousHandlerError
        }

        const timeoutId = window.setTimeout(() => {
            fail(new Error('Flutter 图片上传超时'))
        }, HTTP_UPLOAD_CONFIG.timeout)

        window.receiveMessageFromFlutter = handleFlutterMessage

        try {
            postMessageToFlutter({
                type: 'uploadImage',
                token: getToken(),
            })
        } catch (error) {
            fail(error)
        }
    })
}
