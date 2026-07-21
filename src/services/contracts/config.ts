import type { Address } from 'viem'

import { translate } from '../../i18n/index.ts'
import type { DappContractWriteOptions } from '../dapp/types.ts'

export type ProjectContractEnv = Partial<Record<string, string>>

export interface ProjectContractReadOptions {
    contractAddress?: Address
}

export interface ProjectContractWriteOptions extends DappContractWriteOptions {
    contractAddress?: Address
}

export const PROJECT_CONTRACT_ENV_KEY = {
    aigoToken: 'VITE_AIGO_TOKEN',
    aigoProjectProxy: 'VITE_AIGO_PROJECT_PROXY',
    usdt: 'VITE_USDT',
    aigoRouter: 'VITE_AIGO_ROUTER',
    laxProject: 'VITE_LAX_PROJECT',
} as const

export const PROJECT_CONTRACT_ERROR_MESSAGE = {
    aigoProjectAddressUnavailable: 'contracts.aigoProjectAddressUnavailable',
    laxProjectAddressUnavailable: 'contracts.laxProjectAddressUnavailable',
    aigoTokenAddressUnavailable: 'contracts.aigoTokenAddressUnavailable',
    usdtAddressUnavailable: 'contracts.usdtAddressUnavailable',
    aigoRouterAddressUnavailable: 'contracts.aigoRouterAddressUnavailable',
} as const

function getProjectContractEnv(): ProjectContractEnv {
    return (import.meta.env ?? {}) as unknown as ProjectContractEnv
}

export function readProjectContractEnv(
    key: string,
    fallback = '',
    env: ProjectContractEnv = getProjectContractEnv(),
): string {
    const value = env[key]
    return value ? value : fallback
}

export function requireProjectContractAddress(
    address: Address | undefined,
    errorMessage: string,
): Address {
    if (!address) throw new Error(translate(errorMessage))
    return address
}

export function readProjectContractAddress(
    key: string,
    errorMessage: string,
    explicitAddress?: Address,
): Address {
    return requireProjectContractAddress(
        explicitAddress ?? readProjectContractEnv(key) as Address | undefined,
        errorMessage,
    )
}

export function getAigoProjectAddress(contractAddress?: Address): Address {
    return readProjectContractAddress(
        PROJECT_CONTRACT_ENV_KEY.aigoProjectProxy,
        PROJECT_CONTRACT_ERROR_MESSAGE.aigoProjectAddressUnavailable,
        contractAddress,
    )
}

export function getLaxProjectAddress(contractAddress?: Address): Address {
    return readProjectContractAddress(
        PROJECT_CONTRACT_ENV_KEY.laxProject,
        PROJECT_CONTRACT_ERROR_MESSAGE.laxProjectAddressUnavailable,
        contractAddress,
    )
}

export function getAigoTokenAddress(contractAddress?: Address): Address {
    return readProjectContractAddress(
        PROJECT_CONTRACT_ENV_KEY.aigoToken,
        PROJECT_CONTRACT_ERROR_MESSAGE.aigoTokenAddressUnavailable,
        contractAddress,
    )
}

export function getUsdtAddress(contractAddress?: Address): Address {
    return readProjectContractAddress(
        PROJECT_CONTRACT_ENV_KEY.usdt,
        PROJECT_CONTRACT_ERROR_MESSAGE.usdtAddressUnavailable,
        contractAddress,
    )
}

export function getAigoRouterAddress(contractAddress?: Address): Address {
    return readProjectContractAddress(
        PROJECT_CONTRACT_ENV_KEY.aigoRouter,
        PROJECT_CONTRACT_ERROR_MESSAGE.aigoRouterAddressUnavailable,
        contractAddress,
    )
}
