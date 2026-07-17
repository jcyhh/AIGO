# Stores
全局状态。

This directory stores client-side state that must be shared across components.
这个目录存放需要跨组件共享的客户端状态。

The template uses Zustand as a lightweight state library.
当前模板使用 Zustand 作为轻量状态库。

Store modules are split by ownership.
store 模块按状态归属划分。

- `app`: application-level state such as layout, global dialogs and startup status.
- `app`：应用级状态，例如 layout、全局弹层和启动状态。
- `user`: user-level state such as profile and derived sign-in state.
- `user`：用户级状态，例如用户资料和登录态衍生状态。
- `dapp`: wallet and on-chain state such as wallet address, chain ID and connection status.
- `dapp`：钱包和链上状态，例如钱包地址、链 ID 和连接状态。

Business components should import stores from `src/stores/index.ts`.
业务组件应优先从 `src/stores/index.ts` 导入 store。

```ts
import { useUserStore } from '../stores/index.ts'
```

Use selectors inside components so each component only subscribes to the fields it needs.
组件内使用 selector，让组件只订阅自己真正需要的字段。

```ts
const userInfo = useUserStore((state) => state.userInfo)
```
