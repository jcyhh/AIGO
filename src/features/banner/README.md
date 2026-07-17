# Banner feature
Banner 业务模块。

This is a copyable standalone business module.
这是一个可复制的独立业务模块。

React projects usually keep API calls, types and future data query logic inside the owning feature.
React 项目通常把接口、类型以及后续的数据查询逻辑放在它们所属的 feature 中。

This keeps the change scope focused.
这样可以让改动范围保持集中。

## File responsibilities
## 文件职责

- `api.ts`: defines banner endpoints and does not handle page state.
- `api.ts`：定义 Banner 接口，不处理页面状态。
- `types.ts`: defines response and banner data structures.
- `types.ts`：定义接口响应和 Banner 数据结构。
- `README.md`: documents module conventions and easy-to-forget business rules.
- `README.md`：说明模块约定及容易遗忘的业务规则。

## Usage
## 使用

```ts
import { getBanners } from '@/features/banner/api'

const { banners } = await getBanners()
```

## Extension rules
## 扩展规则

1. Name functions by business action, such as `getBanners()`.
1. 以业务动作命名函数，例如 `getBanners()`。
2. Do not put `apiGet` into function names.
2. 不要把 `apiGet` 写进函数名。
3. Compose request parameters only inside `api.ts`.
3. 仅在 `api.ts` 组合请求参数。
4. Shared auth, status code handling and error handling stay in `services/http`.
4. 通用鉴权、状态码和错误处理继续由 `services/http` 负责。
5. Complete TODO fields in `types.ts` after the backend fields become stable.
5. 后端字段稳定后及时完善 `types.ts` 中的 TODO。
6. Do not let pages guess response structures.
6. 不要让页面自行猜测响应结构。
7. After TanStack Query is introduced, add `queries.ts` for query keys, cache time and hooks.
7. 引入 TanStack Query 后，可增加 `queries.ts` 封装 query key、缓存时间和 hooks。
8. Do not rewrite `api.ts` just because query hooks are added.
8. 不需要因为新增 query hooks 而重写 `api.ts`。

When creating another module, copy this directory and replace the business type, function name, endpoint path and README text.
创建其他模块时可以复制整个目录，然后替换业务类型、函数名、接口路径和本文说明。
