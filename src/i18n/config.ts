import { APP_CONFIG } from '../config/index.ts'

export type LanguageMessages = Record<string, string>

export interface AppLanguage {
    name: string
    code: string
    load: () => Promise<LanguageMessages>
}

async function loadCommonMessages(
    base: Promise<{ default: LanguageMessages }>,
    dappH5: Promise<{ default: LanguageMessages }>,
): Promise<LanguageMessages> {
    const [baseMessages, dappH5Messages] = await Promise.all([base, dappH5])
    return { ...baseMessages.default, ...dappH5Messages.default }
}

export const APP_LANGUAGES = [
    {
        name: 'English', code: 'en',
        load: () => loadCommonMessages(
            import('./locales/common/en.json'),
            import('./locales/common/dappH5/en.json'),
        ),
    },
    {
        name: 'Français', code: 'fr',
        load: () => loadCommonMessages(
            import('./locales/common/fr.json'),
            import('./locales/common/dappH5/fr.json'),
        ),
    },
    {
        name: '한국어', code: 'ko',
        load: () => loadCommonMessages(
            import('./locales/common/ko.json'),
            import('./locales/common/dappH5/ko.json'),
        ),
    },
    {
        name: '日本語', code: 'ja',
        load: () => loadCommonMessages(
            import('./locales/common/ja.json'),
            import('./locales/common/dappH5/ja.json'),
        ),
    },
    {
        name: 'Русский', code: 'ru',
        load: () => loadCommonMessages(
            import('./locales/common/ru.json'),
            import('./locales/common/dappH5/ru.json'),
        ),
    },
    {
        name: 'हिन्दी', code: 'hi',
        load: () => loadCommonMessages(
            import('./locales/common/hi.json'),
            import('./locales/common/dappH5/hi.json'),
        ),
    },
    {
        name: 'Bahasa Melayu', code: 'ms',
        load: () => loadCommonMessages(
            import('./locales/common/ms.json'),
            import('./locales/common/dappH5/ms.json'),
        ),
    },
    {
        name: 'Español', code: 'es',
        load: () => loadCommonMessages(
            import('./locales/common/es.json'),
            import('./locales/common/dappH5/es.json'),
        ),
    },
    {
        name: 'Bahasa Indonesia', code: 'id',
        load: () => loadCommonMessages(
            import('./locales/common/id.json'),
            import('./locales/common/dappH5/id.json'),
        ),
    },
    {
        name: 'Türkçe', code: 'tr',
        load: () => loadCommonMessages(
            import('./locales/common/tr.json'),
            import('./locales/common/dappH5/tr.json'),
        ),
    },
    {
        name: 'Tiếng Việt', code: 'vi',
        load: () => loadCommonMessages(
            import('./locales/common/vi.json'),
            import('./locales/common/dappH5/vi.json'),
        ),
    },
    {
        name: 'ภาษาไทย', code: 'th',
        load: () => loadCommonMessages(
            import('./locales/common/th.json'),
            import('./locales/common/dappH5/th.json'),
        ),
    },
    {
        name: '繁體中文', code: 'zh-Hant',
        load: () => loadCommonMessages(
            import('./locales/common/zh-Hant.json'),
            import('./locales/common/dappH5/zh-Hant.json'),
        ),
    },
    {
        name: '简体中文', code: 'zh-Hans',
        load: () => loadCommonMessages(
            import('./locales/common/zh-Hans.json'),
            import('./locales/common/dappH5/zh-Hans.json'),
        ),
    },
] as const satisfies readonly AppLanguage[]

export const FALLBACK_LANGUAGE_CODE = 'en'
export const FIXED_LANGUAGE_CODE = 'zh-Hans'
export const DEFAULT_LANGUAGE_CODE = APP_CONFIG.enableI18n
    ? APP_CONFIG.defaultLanguageCode
    : FIXED_LANGUAGE_CODE

export function findAppLanguage(code: string): AppLanguage | undefined {
    return APP_LANGUAGES.find((language) => language.code === code)
}
