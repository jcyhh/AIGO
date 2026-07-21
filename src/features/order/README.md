# Order feature
订单业务模块。

封装订单列表和订单收益记录接口。

## Usage
## 使用

```ts
import { getOrders } from '@/features/order/api'

const { orders } = await getOrders({ status: 1 })
```

## API gap
## 接口缺口

`POST /api/orders` 当前只有路由和校验规则，后端控制器方法尚未实现。前端暂不封装成可用业务方法，等后端补齐后再追加。

