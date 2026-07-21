# Claim feature
提取签名业务模块。

封装 `/api/claims`，用于生成链上提取所需的签名数据。

当前前台使用的 `ccy` 包括：

- `balance_xo`：XO 提取，链上写 `claimQuota(...)`。

权重当前只展示用户信息接口返回的余额，不提供前台提取入口。

## Usage
## 使用

```ts
import { createClaim } from '@/features/claim/api'

const claim = await createClaim({ ccy: 'balance_xo', amount: '12.34' })
```
