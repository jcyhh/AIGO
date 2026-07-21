# Swap feature
闪兑业务模块。

封装闪兑记录列表接口；链上卖出 AIGO 的合约交互继续放在 `src/services/contracts`。

## Usage
## 使用

```ts
import { getSwapLogs } from '@/features/swap/api'

const { swap_logs } = await getSwapLogs({ page_no: 1, page_size: 20 })
```

