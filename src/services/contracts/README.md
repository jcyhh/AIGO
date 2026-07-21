# Project contracts

This directory contains project-specific contract wrappers.

通用钱包、切链、gas、合约读写能力仍放在 `src/services/dapp`，这里仅封装当前 AIGO 项目的业务合约。

## Contracts

- `AIGOProjectV1`: 入金、邀请入金、静态收益、动态收益、AIGO 复利、团队业绩和管理方法。
- `LAXProject`: 后端签名后的 `claim`、`claimQuota`，以及相关查询和管理方法。

## Address config

- `VITE_AIGO_PROJECT_PROXY`: AIGOProjectV1 proxy address.
- `VITE_LAX_PROJECT`: LAXProject address.
- `VITE_AIGO_TOKEN`: AIGO token address.
- `VITE_USDT`: USDT token address.
- `VITE_AIGO_ROUTER`: swap router address.

## ABI gaps

The current AIGOProjectV1 ABI exposes the minimum deposit as `minDepositUsdt()`, but does not expose `MAX_ACTIVE_ORDERS`.

当前 ABI 通过 `minDepositUsdt()` 暴露最低入金金额，但未暴露 `MAX_ACTIVE_ORDERS`，所以前端暂不封装最大进行中订单数量读取方法。等后端或合约侧确认 ABI 后再补。

## 合约读取调试日志

所有通过 `readDappContract` 拿到的链上读取结果都会打印为 `[contract:read]`，内容包含合约名或地址、方法名、调用参数和返回值。AIGO 项目业务封装会标记为 `AIGOProjectV1` 或 `LAXProject`。
