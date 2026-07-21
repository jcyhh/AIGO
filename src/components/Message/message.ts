import { createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'

export type MessageType = 'success' | 'info' | 'fail' | 'warning'

export interface MessageOptions {
    message: string
    type?: MessageType
    duration?: number
}

interface NormalizedMessageOptions {
    message: string
    type: MessageType
    duration: number
}

interface MessageFunction {
    (content: string | MessageOptions, type?: MessageType): void
    success: (content: string, duration?: number) => void
    info: (content: string, duration?: number) => void
    fail: (content: string, duration?: number) => void
    warning: (content: string, duration?: number) => void
    close: () => void
}

const DEFAULT_MESSAGE_DURATION = 1500
const MESSAGE_LEAVE_DURATION = 500

let messageRoot: Root | undefined
let messageContainer: HTMLDivElement | undefined
let closeTimer: number | undefined
let removeTimer: number | undefined
let renderVersion = 0
let currentOptions: NormalizedMessageOptions | undefined

function clearTimer(timer: number | undefined): undefined {
    if (timer !== undefined && typeof window !== 'undefined') {
        window.clearTimeout(timer)
    }

    return undefined
}

function getMessageContainer(): HTMLDivElement | undefined {
    if (typeof document === 'undefined') return undefined

    if (!messageContainer) {
        messageContainer = document.createElement('div')
        messageContainer.className = 'message-toast-root'
        document.body.appendChild(messageContainer)
    }

    if (!messageRoot) {
        messageRoot = createRoot(messageContainer)
    }

    return messageContainer
}

function normalizeMessageOptions(
    content: string | MessageOptions,
    type: MessageType = 'warning',
): NormalizedMessageOptions {
    if (typeof content === 'string') {
        return {
            message: content,
            type,
            duration: DEFAULT_MESSAGE_DURATION,
        }
    }

    return {
        message: content.message,
        type: content.type ?? type,
        duration: content.duration ?? DEFAULT_MESSAGE_DURATION,
    }
}

function removeMessage(expectedVersion: number): void {
    if (expectedVersion !== renderVersion) return

    messageRoot?.unmount()
    if (messageContainer) {
        messageContainer.remove()
    }
    messageRoot = undefined
    messageContainer = undefined
    currentOptions = undefined
}

function renderMessage(
    options: NormalizedMessageOptions,
    isLeaving: boolean,
    expectedVersion: number,
): void {
    void import('./Message.tsx').then(({ MessageToast }) => {
        if (expectedVersion !== renderVersion || !messageRoot) return

        messageRoot.render(createElement(MessageToast, {
            message: options.message,
            type: options.type,
            isLeaving,
            onClose: closeMessage,
        }))
    })
}

function showMessage(options: NormalizedMessageOptions): void {
    closeTimer = clearTimer(closeTimer)
    removeTimer = clearTimer(removeTimer)

    if (!getMessageContainer()) return

    currentOptions = options
    const nextVersion = renderVersion + 1
    renderVersion = nextVersion
    renderMessage(options, false, nextVersion)

    if (options.duration > 0 && typeof window !== 'undefined') {
        closeTimer = window.setTimeout(closeMessage, options.duration)
    }
}

function closeMessage(): void {
    closeTimer = clearTimer(closeTimer)
    removeTimer = clearTimer(removeTimer)

    if (!messageRoot || !messageContainer || !currentOptions) return

    const nextVersion = renderVersion + 1
    renderVersion = nextVersion
    renderMessage(currentOptions, true, nextVersion)

    if (typeof window === 'undefined') {
        removeMessage(nextVersion)
        return
    }

    removeTimer = window.setTimeout(() => {
        removeMessage(nextVersion)
    }, MESSAGE_LEAVE_DURATION)
}

const message = ((content: string | MessageOptions, type?: MessageType) => {
    showMessage(normalizeMessageOptions(content, type))
}) as MessageFunction

message.success = (content: string, duration = DEFAULT_MESSAGE_DURATION) => {
    message({ message: content, type: 'success', duration })
}

message.info = (content: string, duration = DEFAULT_MESSAGE_DURATION) => {
    message({ message: content, type: 'info', duration })
}

message.fail = (content: string, duration = DEFAULT_MESSAGE_DURATION) => {
    message({ message: content, type: 'fail', duration })
}

message.warning = (content: string, duration = DEFAULT_MESSAGE_DURATION) => {
    message({ message: content, type: 'warning', duration })
}

message.close = closeMessage

export { closeMessage, message }
