import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { Popup } from '@/components/Popup'

import './ConfirmPopup.scss'

export interface ConfirmPopupProps {
    show: boolean
    message: ReactNode
    title?: ReactNode
    confirmText?: string
    submitting?: boolean
    onClose: () => void
    onConfirm: () => void
}

export function ConfirmPopup({
    show,
    message,
    title,
    confirmText,
    submitting = false,
    onClose,
    onConfirm,
}: ConfirmPopupProps) {
    const { t } = useTranslation()
    const resolvedTitle = title ?? t('提示')
    const resolvedConfirmText = confirmText ?? t('确认')

    return (
        <Popup
            show={show}
            title={<span className="confirm-popup__title size-40 bold-6">{resolvedTitle}</span>}
            onClose={onClose}
            closeOnOverlayClick={false}
            contentTheme="gradient-card"
            contentClassName="confirm-popup"
        >
            <div className="confirm-popup__body mt-40">
                <div className="confirm-popup__message size-28 lh-40 tl">{message}</div>
                <button
                    type="button"
                    className="confirm-popup__confirm size-28 bold-6 mt-40"
                    disabled={submitting}
                    onClick={onConfirm}
                >
                    {resolvedConfirmText}
                </button>
            </div>
        </Popup>
    )
}
