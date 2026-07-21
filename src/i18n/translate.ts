import { appI18n } from './instance.ts'

export function translate(key: string): string {
    if (!appI18n.isInitialized) return key

    const text = appI18n.t(key)
    return text || key
}
