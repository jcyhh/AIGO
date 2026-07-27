import type {
    Abi,
    Address,
    TransactionReceipt,
} from 'viem'

import { useDappStore } from '../../stores/dapp/store.ts'
import {
    DAPP_DEFAULT_GAS_PRICE,
    DAPP_ERROR_MESSAGE,
    DAPP_GAS_LIMIT_MULTIPLIER,
    DAPP_MIN_GAS_BALANCE,
    shouldCheckDappGas,
    shouldEstimateDappGas,
    translateDappErrorMessage,
} from './config.ts'
import {
    logDappContractReadResult,
    logDappContractWriteFailure,
} from './contractDebug.ts'
import { getDappWalletClient } from './provider.ts'
import { getConnectedDappAddress } from './wallet.ts'
import type {
    DappContractActions,
    DappContractReadParams,
    DappContractWriteOptions,
    DappContractWriteParams,
} from './types.ts'

export async function readDappContract<TResult = unknown, TAbi extends Abi = Abi>({
    address,
    account,
    abi,
    functionName,
    args = [],
    debugContractName,
}: DappContractReadParams<TAbi>): Promise<TResult> {
    const walletClient = getDappWalletClient()

    const result = await walletClient.readContract({
        address,
        account,
        abi,
        functionName,
        args,
    } as any) as TResult

    logDappContractReadResult({
        contract: debugContractName ?? address,
        address,
        functionName,
        args,
        result,
    })

    return result
}

export async function estimateDappContractGas<TAbi extends Abi = Abi>({
    address,
    abi,
    functionName,
    args = [],
}: DappContractReadParams<TAbi>): Promise<bigint> {
    const walletClient = getDappWalletClient()
    const account = await getConnectedDappAddress()

    return walletClient.estimateContractGas({
        address,
        abi,
        functionName,
        args,
        account,
    } as any)
}

export async function writeDappContract<TAbi extends Abi = Abi>({
    address,
    abi,
    functionName,
    args = [],
    gas,
    gasPrice,
    value,
    debugContractName,
}: DappContractWriteParams<TAbi>): Promise<TransactionReceipt> {
    let account: Address | undefined
    let isDappLoading = false

    try {
        await checkDappGasBalance()

        const walletClient = getDappWalletClient()
        account = await getConnectedDappAddress()

        useDappStore.getState().setDappLoading(true)
        isDappLoading = true

        const hash = await walletClient.writeContract({
            address,
            abi,
            functionName,
            args,
            account,
            gas,
            gasPrice,
            value,
        } as any)
        const receipt = await walletClient.waitForTransactionReceipt({ hash })

        if (receipt.status === 'reverted') {
            throw new Error(translateDappErrorMessage(DAPP_ERROR_MESSAGE.contractReverted))
        }

        // TODO(feedback): Show a shared success message after the global feedback module is ready.
        // TODO(feedback): 全局反馈模块完成后，在这里展示统一成功提示。
        return receipt
    } catch (error) {
        logDappContractWriteFailure({
            contract: debugContractName ?? address,
            address,
            account,
            functionName,
            args,
            gas,
            gasPrice,
            value,
            error,
        })

        throw error
    } finally {
        if (isDappLoading) {
            useDappStore.getState().setDappLoading(false)
        }
    }
}

export async function writeDappContractWithGas<TAbi extends Abi = Abi>(
    params: DappContractWriteParams<TAbi>,
): Promise<TransactionReceipt> {
    if (!shouldEstimateDappGas()) {
        return writeDappContract(params)
    }

    let estimatedGas: bigint

    try {
        estimatedGas = await estimateDappContractGas(params)
    } catch (error) {
        logDappContractWriteFailure({
            contract: params.debugContractName ?? params.address,
            address: params.address,
            functionName: params.functionName,
            args: params.args ?? [],
            gas: params.gas,
            gasPrice: params.gasPrice,
            value: params.value,
            error,
        })

        throw error
    }

    const gas = estimatedGas * DAPP_GAS_LIMIT_MULTIPLIER / 100n

    return writeDappContract({
        ...params,
        gas,
        gasPrice: params.gasPrice ?? DAPP_DEFAULT_GAS_PRICE,
    })
}

export async function checkDappGasBalance(
    minGasBalance: bigint = DAPP_MIN_GAS_BALANCE,
): Promise<bigint> {
    if (!shouldCheckDappGas()) return 0n

    const walletClient = getDappWalletClient()
    const address = await getConnectedDappAddress()
    const balance = await walletClient.getBalance({ address })

    if (balance < minGasBalance) {
        throw new Error(translateDappErrorMessage(DAPP_ERROR_MESSAGE.gasBalanceInsufficient))
    }

    return balance
}

export function createDappContractActions<TAbi extends Abi>(
    address: Address,
    abi: TAbi,
): DappContractActions {
    return {
        read(functionName, args = []) {
            return readDappContract({ address, abi, functionName, args })
        },
        write(functionName, args = [], options: DappContractWriteOptions = {}) {
            return writeDappContract({
                address,
                abi,
                functionName,
                args,
                ...options,
            })
        },
        writeWithGas(functionName, args = [], options = {}) {
            return writeDappContractWithGas({
                address,
                abi,
                functionName,
                args,
                ...options,
            })
        },
        estimateGas(functionName, args = []) {
            return estimateDappContractGas({ address, abi, functionName, args })
        },
    }
}
