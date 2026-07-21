import { APP_CONFIG } from '../config/index.ts'

export type LanguageMessages = Record<string, string>

export interface AppLanguage {
    name: string
    code: string
    load: () => Promise<LanguageMessages>
}

async function loadLanguageMessages(
    base: Promise<{ default: LanguageMessages }>,
    dappH5: Promise<{ default: LanguageMessages }>,
    project: Promise<{ default: LanguageMessages }>,
): Promise<LanguageMessages> {
    const [baseMessages, dappH5Messages, projectMessages] = await Promise.all([
        base,
        dappH5,
        project,
    ])
    return {
        ...baseMessages.default,
        ...dappH5Messages.default,
        ...projectMessages.default,
    }
}

export const APP_LANGUAGES = [
    {
        name: 'English', code: 'en',
        load: () => loadLanguageMessages(
            import('./locales/common/en.json'),
            import('./locales/common/dappH5/en.json'),
            import('./locales/project/en.json'),
        ),
    },
    {
        name: '日本語', code: 'ja',
        load: () => loadLanguageMessages(
            import('./locales/common/ja.json'),
            import('./locales/common/dappH5/ja.json'),
            import('./locales/project/ja.json'),
        ),
    },
    {
        name: '한국어', code: 'ko',
        load: () => loadLanguageMessages(
            import('./locales/common/ko.json'),
            import('./locales/common/dappH5/ko.json'),
            import('./locales/project/ko.json'),
        ),
    },
    {
        name: 'Русский', code: 'ru',
        load: () => loadLanguageMessages(
            import('./locales/common/ru.json'),
            import('./locales/common/dappH5/ru.json'),
            import('./locales/project/ru.json'),
        ),
    },
    {
        name: '繁體中文', code: 'zh-Hant',
        load: () => loadLanguageMessages(
            import('./locales/common/zh-Hant.json'),
            import('./locales/common/dappH5/zh-Hant.json'),
            import('./locales/project/zh-Hant.json'),
        ),
    },
    {
        name: '简体中文', code: 'zh-Hans',
        load: () => loadLanguageMessages(
            import('./locales/common/zh-Hans.json'),
            import('./locales/common/dappH5/zh-Hans.json'),
            import('./locales/project/zh-Hans.json'),
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
