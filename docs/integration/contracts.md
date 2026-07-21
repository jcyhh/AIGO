# 合约对接摘要

## 基础约定

| 项 | 说明 |
| --- | --- |
| 项目合约封装 | `src/services/contracts` |
| 通用 DApp 能力 | `src/services/dapp` |
| ERC20 通用封装 | `src/services/dapp/erc20.ts` |
| 金额单位转换 | `src/services/dapp/units.ts` |
| 代币展示常量 | `src/config/token.ts` |
| 合约读取日志 | 统一打印 `[contract:read]`，带合约名、方法名、参数和结果 |

## 地址环境变量

| 环境变量 | 说明 | 读取方法 |
| --- | --- | --- |
| `VITE_AIGO_PROJECT_PROXY` | AIGOProjectV1 代理合约 | `getAigoProjectAddress` |
| `VITE_LAX_PROJECT` | LAXProject 合约 | `getLaxProjectAddress` |
| `VITE_AIGO_TOKEN` | 平台币合约 | `getAigoTokenAddress` |
| `VITE_USDT` | USDT 合约 | `getUsdtAddress` |
| `VITE_AIGO_ROUTER` | Swap Router | `getAigoRouterAddress` |

`.env.production` 中 `VITE_BASE_URL` 和 `VITE_RPC_URL` 必须留空；生产链配置走 `DAPP_PRODUCTION_CHAIN`。

## 代币常量

| 常量 | 当前展示名 | 用途 |
| --- | --- | --- |
| `PROJECT_TOKEN.usdt.symbol` | `Token` | Token 余额、入金金额、兑换目标 |
| `PROJECT_TOKEN.platform.symbol` | `AIGO` | 平台币展示文案，后续改名只改常量 |

## ERC20

| 方法 | 用途 |
| --- | --- |
| `readErc20Balance(tokenAddress, owner)` | 查询指定 ERC20 余额 |
| `readErc20Allowance(spender, tokenAddress, owner)` | 查询授权额度 |
| `ensureErc20Allowance(spender, amount, tokenAddress, owner)` | 授权不足时发起 approve |
| `writeErc20Approve(spender, amount, tokenAddress)` | 授权 |
| `writeErc20Transfer(to, amount, tokenAddress)` | 转账 |

首页入金区余额读取的是 `VITE_USDT` 对应 ERC20 的 `balanceOf`，不是平台币余额。

## AIGOProjectV1

| 业务 | 读方法 | 写方法 | 备注 |
| --- | --- | --- | --- |
| 根用户 | `readAigoProjectRootReferral` | - | `rootReferral()` |
| 是否已绑定上级 | `readAigoProjectIsReferralBound` | - | 登录/刷新后作为全局状态 |
| 邀请上级 | `readAigoProjectReferralOf` | - | 已绑定用户才显示邀请链接 |
| 团队总业绩 | `readAigoProjectTotalTeamPerformanceUsdt` | - | `totalTeamPerformanceUsdt(address)` |
| 最低入金 | `readAigoProjectMinDepositUsdt` | - | `minDepositUsdt()` |
| 最高入金 | `readAigoProjectMaxDepositUsdt` | - | `maxDepositUsdt()` |
| 全部订单数量 | `readAigoProjectOrderCount` | - | `orderCount(address)` |
| 进行中订单数量 | `readAigoProjectActiveOrderCount` | - | `activeOrderCount(address)` |
| 单个订单 | `readAigoProjectOrder` | - | `getOrder(address,index)`，`status=true` 为进行中 |
| 入金 | - | `writeAigoProjectDeposit` / `writeAigoProjectDepositWithInvite` | 有邀请码时走邀请入金 |
| 静态收益预览 | `readAigoProjectPendingStaticRewards` | - | `pendingStaticRewards(indexes)` |
| 领取静态收益 | - | `writeAigoProjectClaimStaticRewards` | 文案统一使用“提取” |
| 动态收益预览 | `readAigoProjectPendingDynamicReward` | - | `pendingDynamicReward(address)` |
| 领取动态收益 | - | `writeAigoProjectClaimDynamicReward` | 文案统一使用“提取” |
| 卖平台币 | - | `writeAigoProjectSellAIGO` | `sellAIGO(aigoAmount,minUsdtOut)` |
| 复利最大入金 | `readAigoProjectMaxAigoStake` | - | `maxAIGOStake()` |
| 复利当前本息 | `readAigoProjectCurrentAigoStakeBalance` | - | `currentAIGOStakeBalance(address)` |
| 复利解锁时间 | `readAigoProjectAigoUnlockAt` | - | `aigoUnlockAt(address)` |
| 参加复利 | - | `writeAigoProjectDepositAIGO` | `depositAIGO(amount)` |
| 提取复利本息 | - | `writeAigoProjectWithdrawAIGO` | `withdrawAIGO(amount)` |

当前 ABI 没有公开 `MAX_ACTIVE_ORDERS` getter，前端按业务确认值 `50` 处理。

## LAXProject

| 业务 | 读方法 | 写方法 | 备注 |
| --- | --- | --- | --- |
| 合约内平台币地址 | `readLaxProjectLaxo` | - | `LAXO()` |
| 合约内 USDT 地址 | `readLaxProjectUsdt` | - | `USDT()` |
| 已提额度 | `readLaxProjectClaimedQuota` | - | `claimedQuota(address)` |
| 普通提取状态 | `readLaxProjectIsClaim` | - | `isClaim(id)` |
| 额度提取状态 | `readLaxProjectIsQuotaClaim` | - | `isQuotaClaim(id)` |
| 签名者 | `readLaxProjectSigner` | - | `signer()` |
| 普通签名提取 | - | `writeLaxProjectClaim` | 使用后端返回的签名参数 |
| 额度签名提取 | - | `writeLaxProjectClaimQuota` | 使用后端返回的签名参数 |

LAXProject 的提取参数来自后端接口返回的签名数据，前端不要自行拼签名。

## 待读数据映射

| 页面/模块 | 优先数据源 |
| --- | --- |
| 首页 Token 余额 | ERC20 `readErc20Balance(getUsdtAddress(), walletAddress)` |
| 首页订单列表 | AIGOProjectV1 `orderCount` + `getOrder` |
| 首页静态收益 | AIGOProjectV1 `pendingStaticRewards` |
| 首页动态收益 | AIGOProjectV1 `pendingDynamicReward` |
| 侧边栏邀请链接 | AIGOProjectV1 `isReferralBound` + 当前钱包地址 |
| 闪兑 | AIGOProjectV1 `sellAIGO`，记录走后端 `swap_logs` |
| 存钱罐 | AIGOProjectV1 `maxAIGOStake`、`currentAIGOStakeBalance`、`aigoUnlockAt`、`depositAIGO`、`withdrawAIGO` |
