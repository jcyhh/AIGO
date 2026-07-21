import closeIcon from '@/assets/message/message-close.png'
import failIcon from '@/assets/message/message-fail.png'
import infoIcon from '@/assets/message/message-info.png'
import successIcon from '@/assets/message/message-success.png'
import warningIcon from '@/assets/message/message-warning.png'

import type { MessageType } from './message.ts'

export interface MessageToastProps {
    message: string
    type: MessageType
    isLeaving?: boolean
    onClose: () => void
}

const MESSAGE_ICON_SRC: Record<MessageType, string> = {
    success: successIcon,
    info: infoIcon,
    fail: failIcon,
    warning: warningIcon,
}

export function MessageToast({
    message,
    type,
    isLeaving = false,
    onClose,
}: MessageToastProps) {
    const animationClassName = isLeaving
        ? 'animate__zoomOut'
        : 'animate__slideInUp'

    const toastClassName = [
        'message-toast',
        `message-toast--${type}`,
        'animate__animated',
        animationClassName,
        'ani-5',
    ].join(' ')

    return (
        <div
            className={toastClassName}
            role="status"
            aria-live="polite"
        >
            <div className="message-toast__box flex items-center pt-24 pr-26 pb-24 pl-26">
                <img
                    className="message-toast__icon mr-20 flex-none"
                    src={MESSAGE_ICON_SRC[type]}
                    alt=""
                />
                <span className="message-toast__text flex-1 size-24 lh-34 word-break">
                    {message}
                </span>
                <button
                    className="message-toast__close flex-center ml-20 flex-none"
                    type="button"
                    aria-label="Close message"
                    onClick={onClose}
                >
                    <img
                        className="message-toast__close-icon"
                        src={closeIcon}
                        alt=""
                    />
                </button>
            </div>
        </div>
    )
}
