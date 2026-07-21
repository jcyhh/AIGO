export interface DappContractReadDebugInfo {
    contract: string
    address: string
    functionName: string
    args: readonly unknown[]
    result: unknown
}

export interface DappContractWriteFailureDebugInfo {
    contract: string
    address: string
    account?: string
    functionName: string
    args: readonly unknown[]
    gas?: bigint
    gasPrice?: bigint
    value?: bigint
    error: unknown
}

export const DAPP_CONTRACT_READ_LOG_LABEL = '[contract:read]'
export const DAPP_CONTRACT_WRITE_FAILED_LOG_LABEL = '[contract:write:failed]'

function formatDappContractLogValue(value: unknown): unknown {
    if (typeof value === 'bigint') return value.toString()

    if (Array.isArray(value)) {
        return value.map((item) => formatDappContractLogValue(item))
    }

    if (value && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value as Record<string, unknown>).map(([key, item]) => [
                key,
                formatDappContractLogValue(item),
            ]),
        )
    }

    return value
}

export function logDappContractReadResult({
    contract,
    address,
    functionName,
    args,
    result,
}: DappContractReadDebugInfo): void {
    console.log(DAPP_CONTRACT_READ_LOG_LABEL, {
        contract,
        address,
        functionName,
        args: formatDappContractLogValue(args),
        result: formatDappContractLogValue(result),
    })
}

export function logDappContractWriteFailure({
    contract,
    address,
    account,
    functionName,
    args,
    gas,
    gasPrice,
    value,
    error,
}: DappContractWriteFailureDebugInfo): void {
    console.error(DAPP_CONTRACT_WRITE_FAILED_LOG_LABEL, {
        contract,
        address,
        account,
        functionName,
        args: formatDappContractLogValue(args),
        gas: formatDappContractLogValue(gas),
        gasPrice: formatDappContractLogValue(gasPrice),
        value: formatDappContractLogValue(value),
        error: error instanceof Error ? error.message : String(error),
    })
}
