import type { Address } from 'viem'

import { ROUTE_PATH } from '../../router/routes.ts'
import { readAigoProjectIsReferralBound } from '../../services/contracts/aigoProject.ts'
import { getWalletAddress } from '../../services/storage/common.ts'
import { useUserStore } from '../../stores/user/store.ts'

export const REFERRAL_INVITE_PLACEHOLDER = '--'
export const REFERRAL_BOUND_READ_FAILED_LABEL = '[contract:read:failed]'

const REFERRAL_BOUND_CONTRACT_NAME = 'AIGOProjectV1'
const REFERRAL_BOUND_FUNCTION_NAME = 'isReferralBound'

type ReadReferralBound = (address: Address) => Promise<boolean>

export interface SyncReferralBoundStateOptions {
    walletAddress?: string
    readIsReferralBound?: ReadReferralBound
}

function normalizeWalletAddress(walletAddress?: string): Address | undefined {
    const value = walletAddress?.trim()

    return value ? value as Address : undefined
}

function getCurrentOrigin(): string {
    return typeof window === 'undefined' ? '' : window.location.origin
}

function formatReferralBoundReadError(error: unknown): string {
    if (error instanceof Error) return error.message
    return String(error)
}

function printReferralBoundReadFailure(address: Address, error: unknown): void {
    console.warn(REFERRAL_BOUND_READ_FAILED_LABEL, {
        contract: REFERRAL_BOUND_CONTRACT_NAME,
        functionName: REFERRAL_BOUND_FUNCTION_NAME,
        args: [address],
        error: formatReferralBoundReadError(error),
    })
}

export function buildReferralInviteLink(
    walletAddress: string,
    origin = getCurrentOrigin(),
): string {
    const value = walletAddress.trim()

    if (!value) return REFERRAL_INVITE_PLACEHOLDER

    const referralPath = ROUTE_PATH.referral.replace(
        ':ref',
        encodeURIComponent(value),
    )

    return `${origin}${referralPath}`
}

export async function syncReferralBoundState({
    walletAddress = getWalletAddress(),
    readIsReferralBound = readAigoProjectIsReferralBound,
}: SyncReferralBoundStateOptions = {}): Promise<boolean> {
    const address = normalizeWalletAddress(walletAddress)

    if (!address) {
        useUserStore.getState().setReferralBound(false)
        return false
    }

    try {
        const isReferralBound = await readIsReferralBound(address)
        useUserStore.getState().setReferralBound(isReferralBound)
        return isReferralBound
    } catch (error) {
        printReferralBoundReadFailure(address, error)
        useUserStore.getState().setReferralBound(false)
        return false
    }
}
