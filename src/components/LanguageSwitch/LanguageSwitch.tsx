import {
    useMemo,
    useRef,
    useState,
    type KeyboardEvent,
    type ReactNode,
} from 'react'
import { useTranslation } from 'react-i18next'

import languageIconUrl from '@/assets/layout/headbar/lang.svg'
import { Picker, type PickerConfirmPayload, type PickerOption } from '@/components/Picker'
import { APP_CONFIG } from '@/config/index.ts'
import { changeAppLanguage } from '@/i18n/changeAppLanguage.ts'
import { APP_LANGUAGES } from '@/i18n/config.ts'
import { useAppStore } from '@/stores/app/store.ts'

import './LanguageSwitch.scss'

export interface LanguageSwitchProps {
    children?: ReactNode
    className?: string
    onOpen?: () => void
}

function getLanguageIndex(languageCode: string): number {
    const index = APP_LANGUAGES.findIndex((language) => language.code === languageCode)
    return index >= 0 ? index : 0
}

export function LanguageSwitch(props: LanguageSwitchProps) {
    if (!APP_CONFIG.enableI18n) {
        return null
    }

    return <LanguageSwitchContent {...props} />
}

function LanguageSwitchContent({
    children,
    className = '',
    onOpen,
}: LanguageSwitchProps) {
    const { t } = useTranslation()
    const languageCode = useAppStore((state) => state.languageCode)
    const confirmedLanguageCodeRef = useRef('')
    const [showLanguagePopup, setShowLanguagePopup] = useState(false)
    const [pendingLanguageCode, setPendingLanguageCode] = useState(languageCode)
    const languagePickerOptions = useMemo<PickerOption[]>(
        () => APP_LANGUAGES.map((language) => ({
            label: language.name,
            value: language.code,
        })),
        [],
    )
    const pendingLanguageIndex = useMemo(
        () => getLanguageIndex(pendingLanguageCode),
        [pendingLanguageCode],
    )
    const classes = ['language-switch', className]
        .filter(Boolean)
        .join(' ')
    const triggerContent = children === undefined ? (
        <img src={languageIconUrl} className="language-switch__default" alt="Language" />
    ) : children

    function openLanguageSwitch() {
        confirmedLanguageCodeRef.current = ''
        setPendingLanguageCode(languageCode)
        setShowLanguagePopup(true)
        onOpen?.()
    }

    function closeLanguageSwitch() {
        setShowLanguagePopup(false)
    }

    function handleOpenLanguageSwitch() {
        openLanguageSwitch()
    }

    function handleLanguageSwitchKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        if (event.key !== 'Enter' && event.key !== ' ') return

        event.preventDefault()
        openLanguageSwitch()
    }

    function handleLanguagePickerChange({ option }: PickerConfirmPayload) {
        if (typeof option?.value !== 'string') return

        setPendingLanguageCode(option.value)
    }

    async function handleLanguagePickerConfirm({ option }: PickerConfirmPayload) {
        if (typeof option?.value !== 'string') return

        const hasLanguageChanged = option.value !== languageCode
        if (!hasLanguageChanged) return

        confirmedLanguageCodeRef.current = option.value
        closeLanguageSwitch()
    }

    async function handleLanguagePopupAfterClose() {
        const languageCodeToChange = confirmedLanguageCodeRef.current
        if (!languageCodeToChange) return

        confirmedLanguageCodeRef.current = ''

        const changed = await changeAppLanguage(languageCodeToChange)
        if (!changed) return

        if (typeof window !== 'undefined') {
            window.location.reload()
        }
    }

    return (
        <>
            <div
                className={classes}
                role="button"
                tabIndex={0}
                onClick={handleOpenLanguageSwitch}
                onKeyDown={handleLanguageSwitchKeyDown}
            >
                {triggerContent}
            </div>

            <Picker
                show={showLanguagePopup}
                options={languagePickerOptions}
                value={pendingLanguageIndex}
                title={t('切换语言')}
                confirmText={t('确认')}
                onClose={closeLanguageSwitch}
                onChange={handleLanguagePickerChange}
                onConfirm={handleLanguagePickerConfirm}
                onAfterClose={handleLanguagePopupAfterClose}
            />
        </>
    )
}
