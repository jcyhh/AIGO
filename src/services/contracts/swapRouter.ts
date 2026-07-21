import type {
    Abi,
    Address,
} from 'viem'

import { readDappContract } from '../dapp/contract.ts'
import uniswapV2RouterAbi from '../../vendor/uniswapV2Router/abi.json' with { type: 'json' }
import {
    getAigoRouterAddress,
    type ProjectContractReadOptions,
} from './config.ts'

export const AIGO_ROUTER_ABI = uniswapV2RouterAbi as Abi

function getAigoRouterContractAddress(options: ProjectContractReadOptions = {}): Address {
    return getAigoRouterAddress(options.contractAddress)
}

function readAigoRouter<TResult>(
    functionName: string,
    args: readonly unknown[] = [],
    options: ProjectContractReadOptions = {},
): Promise<TResult> {
    return readDappContract<TResult>({
        address: getAigoRouterContractAddress(options),
        abi: AIGO_ROUTER_ABI,
        functionName,
        args,
        debugContractName: 'AIGO Router',
    })
}

export function readAigoRouterAmountsOut(
    amountIn: bigint,
    path: readonly Address[],
    options?: ProjectContractReadOptions,
): Promise<readonly bigint[]> {
    return readAigoRouter('getAmountsOut', [amountIn, path], options)
}
