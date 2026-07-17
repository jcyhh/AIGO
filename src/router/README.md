# Router
路由模块。

The project always uses browser history mode.
项目固定使用浏览器 history 模式。

The app base path is controlled by `APP_CONFIG.routeBase`, and the current template value is `/h5/`.
应用基础路径由 `APP_CONFIG.routeBase` 控制，当前模板值为 `/h5/`。

The layout menu type is controlled by `APP_CONFIG.defaultLayoutMenuType`. `tabbar` and `sidebar` are mutually exclusive project modes.
layout 菜单类型由 `APP_CONFIG.defaultLayoutMenuType` 控制。`tabbar` 和 `sidebar` 是互斥的项目模式。

Use the navigation helpers inside React components.
在 React 组件内使用路由跳转辅助方法。

```tsx
import { ROUTE_PATH, useAppNavigate } from '../router/index.ts'

function Demo() {
    const { pushRoute, replaceRoute, backRoute } = useAppNavigate()

    return (
        <>
            <button onClick={() => pushRoute(ROUTE_PATH.home)}>Go home</button>
            <button onClick={() => replaceRoute(ROUTE_PATH.swap)}>Replace with Swap</button>
            <button onClick={() => backRoute()}>Go back</button>
        </>
    )
}
```

Do not manually prepend `/h5` when calling `pushRoute(ROUTE_PATH.home)`.
调用 `pushRoute(ROUTE_PATH.home)` 时不要手动拼接 `/h5`。

React Router handles the base path through `basename`.
React Router 会通过 `basename` 自动处理基础路径。

Use `buildRouteHref` only when code outside React components needs to generate a link.
只有组件外代码需要生成链接时，才使用 `buildRouteHref`。

```ts
buildRouteHref(ROUTE_PATH.home) // /h5/home
```
