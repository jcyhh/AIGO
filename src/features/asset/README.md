# Asset feature
资产业务模块。

封装资产变动日志等面向用户资产记录的客户端接口。

## Usage
## 使用

```ts
import { getAssetLogs } from '@/features/asset/api'

const { asset_logs } = await getAssetLogs({ page_no: 1, page_size: 20 })
```

