# User feature
用户业务模块。

This directory is an example of organizing code by business capability.
这个目录是“按业务能力组织代码”的示例。

Do not put all project API calls into one global `api.ts`.
不要把全项目的请求都堆进一个全局 `api.ts`。

## File responsibilities
## 文件职责

- `api.ts`: describes endpoint URLs, request methods and request/response types.
- `api.ts`：描述接口地址、请求方法和请求/响应类型。
- `types.ts`: stores data types exposed by this business module.
- `types.ts`：保存该业务模块对外使用的数据类型。
- `README.md`: records conventions, special rules and usage.
- `README.md`：记录约定、特殊规则和使用方式。

## Usage
## 使用

```ts
import { getCurrentUser } from '@/features/user/api'

const user = await getCurrentUser()
```

Function names should describe business meaning instead of low-level request details.
函数名应描述业务语义，而不是底层请求细节。

Use `getCurrentUser()` instead of names such as `apiGetUser()`.
使用 `getCurrentUser()`，不要使用 `apiGetUser()` 这类名字。

The caller only needs to know that it gets the current user.
调用方只需要知道它是在获取当前用户。

The caller should not care whether the endpoint uses GET or POST.
调用方不需要关心接口底层使用 GET 还是 POST。

## Extension rules
## 扩展规则

1. Keep new user-related endpoints in this directory.
1. 新增用户相关接口时继续放在本目录。
2. Split by sub-domain only after the module becomes clearly large.
2. 模块明显变大后再按子业务拆分。
3. Complete `types.ts` from real API responses before using the data in pages.
3. 先根据接口真实返回值补充 `types.ts`，再在页面中使用数据。
4. Do not use `any`.
4. 不要使用 `any`。
5. API functions should directly return the shared `request()` result when there is no extra logic.
5. 没有额外逻辑时，API 函数直接返回共享 `request()`。
6. Do not add unnecessary `async/await`.
6. 不要写多余的 `async/await`。
7. Add `queries.ts` later if TanStack Query manages caching, auto refresh or request status.
7. 将来由 TanStack Query 管理缓存、自动刷新和请求状态时，可新增 `queries.ts`。
8. Keep low-level endpoint functions in `api.ts`.
8. 底层接口函数仍保留在 `api.ts`。

When copying this directory for a new feature, replace the directory name, types, function names and URLs while keeping the same responsibility boundaries.
复制本目录创建新 feature 时，替换目录名、类型、函数名和 URL，并保留相同的职责边界。
