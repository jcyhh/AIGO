import { setReferralCode } from '../../services/storage/index.ts'

export function saveSplashReferralCode(referralCode?: string): boolean {
    const value = referralCode?.trim()

    if (!value) return false

    setReferralCode(value)
    return true
}
