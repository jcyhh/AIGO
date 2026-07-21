import {
    parseAbi,
    type Address,
    type Hex,
    type TransactionReceipt,
} from 'viem'

import {
    readDappContract,
    writeDappContractWithGas,
} from '../dapp/contract.ts'
import type { DappContractWriteOptions } from '../dapp/types.ts'
import {
    getLaxProjectAddress,
    type ProjectContractReadOptions,
    type ProjectContractWriteOptions,
} from './config.ts'

export const LAX_PROJECT_ABI = parseAbi([
    'function LAXO() view returns (address)',
    'function USDT() view returns (address)',
    'function claim(uint256 _id, address _token, uint256 _amount, uint256 _expiredTime, bytes signature)',
    'function claimQuota(uint256 _id, uint256 _amount, uint256 _expiredTime, bytes signature)',
    'function claimedQuota(address user) view returns (uint256)',
    'function dividend()',
    'function dividendWallet() view returns (address)',
    'function ecosystemAddress() view returns (address)',
    'function eip712Domain() view returns (bytes1 fields, string name, string version, uint256 chainId, address verifyingContract, bytes32 salt, uint256[] extensions)',
    'function emergencyWithdraw(address _token, address _to, uint256 _amount)',
    'function emergencyWithdrawContract(address _contract, address _token, address _to, uint256 _amount)',
    'function isClaim(uint256 _id) view returns (bool)',
    'function isQuotaClaim(uint256 _id) view returns (bool)',
    'function marketingAddress() view returns (address)',
    'function owner() view returns (address)',
    'function renounceOwnership()',
    'function setEcosystemAddress(address addr)',
    'function setLAXO(address LAXO_)',
    'function setMarketingAddress(address addr)',
    'function setSigner(address _signer)',
    'function signer() view returns (address)',
    'function transferOwnership(address newOwner)',
])

export interface LaxProjectSignedClaimParams {
    id: bigint
    token: Address
    amount: bigint
    expiredTime: bigint
    signature: Hex
}

export interface LaxProjectSignedQuotaClaimParams {
    id: bigint
    amount: bigint
    expiredTime: bigint
    signature: Hex
}

export type LaxProjectEip712Domain = readonly [
    fields: Hex,
    name: string,
    version: string,
    chainId: bigint,
    verifyingContract: Address,
    salt: Hex,
    extensions: readonly bigint[],
]

function getLaxProjectContractAddress(options: ProjectContractReadOptions = {}): Address {
    return getLaxProjectAddress(options.contractAddress)
}

function readLaxProject<TResult>(
    functionName: string,
    args: readonly unknown[] = [],
    options: ProjectContractReadOptions = {},
): Promise<TResult> {
    return readDappContract<TResult>({
        address: getLaxProjectContractAddress(options),
        abi: LAX_PROJECT_ABI,
        functionName,
        args,
        debugContractName: 'LAXProject',
    })
}

function writeLaxProject(
    functionName: string,
    args: readonly unknown[] = [],
    options: ProjectContractWriteOptions = {},
): Promise<TransactionReceipt> {
    const {
        contractAddress,
        ...writeOptions
    } = options

    return writeDappContractWithGas({
        address: getLaxProjectAddress(contractAddress),
        abi: LAX_PROJECT_ABI,
        functionName,
        args,
        debugContractName: 'LAXProject',
        ...writeOptions,
    })
}

export function readLaxProjectLaxo(
    options?: ProjectContractReadOptions,
): Promise<Address> {
    return readLaxProject('LAXO', [], options)
}

export function readLaxProjectUsdt(
    options?: ProjectContractReadOptions,
): Promise<Address> {
    return readLaxProject('USDT', [], options)
}

export function readLaxProjectClaimedQuota(
    user: Address,
    options?: ProjectContractReadOptions,
): Promise<bigint> {
    return readLaxProject('claimedQuota', [user], options)
}

export function readLaxProjectDividendWallet(
    options?: ProjectContractReadOptions,
): Promise<Address> {
    return readLaxProject('dividendWallet', [], options)
}

export function readLaxProjectEcosystemAddress(
    options?: ProjectContractReadOptions,
): Promise<Address> {
    return readLaxProject('ecosystemAddress', [], options)
}

export function readLaxProjectEip712Domain(
    options?: ProjectContractReadOptions,
): Promise<LaxProjectEip712Domain> {
    return readLaxProject('eip712Domain', [], options)
}

export function readLaxProjectIsClaim(
    id: bigint,
    options?: ProjectContractReadOptions,
): Promise<boolean> {
    return readLaxProject('isClaim', [id], options)
}

export function readLaxProjectIsQuotaClaim(
    id: bigint,
    options?: ProjectContractReadOptions,
): Promise<boolean> {
    return readLaxProject('isQuotaClaim', [id], options)
}

export function readLaxProjectMarketingAddress(
    options?: ProjectContractReadOptions,
): Promise<Address> {
    return readLaxProject('marketingAddress', [], options)
}

export function readLaxProjectOwner(
    options?: ProjectContractReadOptions,
): Promise<Address> {
    return readLaxProject('owner', [], options)
}

export function readLaxProjectSigner(
    options?: ProjectContractReadOptions,
): Promise<Address> {
    return readLaxProject('signer', [], options)
}

export function writeLaxProjectClaim(
    params: LaxProjectSignedClaimParams,
    options?: ProjectContractWriteOptions,
): Promise<TransactionReceipt> {
    return writeLaxProject(
        'claim',
        [
            params.id,
            params.token,
            params.amount,
            params.expiredTime,
            params.signature,
        ],
        options,
    )
}

export function writeLaxProjectClaimQuota(
    params: LaxProjectSignedQuotaClaimParams,
    options?: ProjectContractWriteOptions,
): Promise<TransactionReceipt> {
    return writeLaxProject(
        'claimQuota',
        [
            params.id,
            params.amount,
            params.expiredTime,
            params.signature,
        ],
        options,
    )
}

export function writeLaxProjectDividend(
    options?: ProjectContractWriteOptions,
): Promise<TransactionReceipt> {
    return writeLaxProject('dividend', [], options)
}

export function writeLaxProjectEmergencyWithdraw(
    token: Address,
    to: Address,
    amount: bigint,
    options?: ProjectContractWriteOptions,
): Promise<TransactionReceipt> {
    return writeLaxProject('emergencyWithdraw', [token, to, amount], options)
}

export function writeLaxProjectEmergencyWithdrawContract(
    contract: Address,
    token: Address,
    to: Address,
    amount: bigint,
    options?: ProjectContractWriteOptions,
): Promise<TransactionReceipt> {
    return writeLaxProject('emergencyWithdrawContract', [contract, token, to, amount], options)
}

export function writeLaxProjectRenounceOwnership(
    options?: ProjectContractWriteOptions,
): Promise<TransactionReceipt> {
    return writeLaxProject('renounceOwnership', [], options)
}

export function writeLaxProjectSetEcosystemAddress(
    address: Address,
    options?: ProjectContractWriteOptions,
): Promise<TransactionReceipt> {
    return writeLaxProject('setEcosystemAddress', [address], options)
}

export function writeLaxProjectSetLaxo(
    address: Address,
    options?: ProjectContractWriteOptions,
): Promise<TransactionReceipt> {
    return writeLaxProject('setLAXO', [address], options)
}

export function writeLaxProjectSetMarketingAddress(
    address: Address,
    options?: ProjectContractWriteOptions,
): Promise<TransactionReceipt> {
    return writeLaxProject('setMarketingAddress', [address], options)
}

export function writeLaxProjectSetSigner(
    signer: Address,
    options?: ProjectContractWriteOptions,
): Promise<TransactionReceipt> {
    return writeLaxProject('setSigner', [signer], options)
}

export function writeLaxProjectTransferOwnership(
    newOwner: Address,
    options?: ProjectContractWriteOptions,
): Promise<TransactionReceipt> {
    return writeLaxProject('transferOwnership', [newOwner], options)
}

export function createLaxProjectActions(contractAddress?: Address) {
    const readOptions = { contractAddress }
    const withAddress = (options: DappContractWriteOptions = {}) => ({
        ...options,
        contractAddress,
    })

    return {
        readLaxo: () => readLaxProjectLaxo(readOptions),
        readUsdt: () => readLaxProjectUsdt(readOptions),
        readClaimedQuota: (user: Address) => readLaxProjectClaimedQuota(user, readOptions),
        readIsClaim: (id: bigint) => readLaxProjectIsClaim(id, readOptions),
        readIsQuotaClaim: (id: bigint) => readLaxProjectIsQuotaClaim(id, readOptions),
        readSigner: () => readLaxProjectSigner(readOptions),
        readOwner: () => readLaxProjectOwner(readOptions),
        writeClaim: (params: LaxProjectSignedClaimParams, options?: DappContractWriteOptions) => writeLaxProjectClaim(params, withAddress(options)),
        writeClaimQuota: (params: LaxProjectSignedQuotaClaimParams, options?: DappContractWriteOptions) => writeLaxProjectClaimQuota(params, withAddress(options)),
    }
}
