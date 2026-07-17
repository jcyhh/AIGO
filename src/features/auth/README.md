# Auth

Authentication business module.

认证业务模块。

The local `TOKEN` is the single source of truth for authentication; the `user` Store is only its React-facing mirror for pages and route guards.

登录态的唯一依据是本地 `TOKEN`；`user` Store 只同步给 React 页面和路由守卫使用。

## Entry flow

The splash page calls `startAuthFlow()` to make the startup decision.

开屏页调用 `startAuthFlow()` 统一处理启动分流。

- `dapp` waits twice for an injected wallet provider, five seconds per attempt. If both attempts fail, the splash page remains visible and asks the user to open the DApp in a wallet browser.
- `dapp` 会连续等待两次注入钱包 Provider，每次五秒；两次都失败时，保留开屏页并提示用户使用钱包环境打开。
- `hybrid` waits once for a wallet provider, then falls back to account password login when no provider is found.
- `hybrid` 只等待一次钱包 Provider，未检测到时降级为账号密码登录。
- `account` never detects a wallet provider or shows a loading icon; it waits for the splash animation and then follows the token state.
- `account` 不检测钱包 Provider，也不显示 loading；等待开屏动画后按 Token 状态继续。
- Flutter hosts without `window.__EXPECT_DAPP_PROVIDER__` skip the delayed detection. When Flutter sets this marker before React starts, the same delayed wallet detection is used.
- 未设置 `window.__EXPECT_DAPP_PROVIDER__` 的 Flutter 宿主会跳过延迟检测；Flutter 在 React 启动前设置该标识时，则使用相同的延迟钱包检测。
- Existing token with a detected provider: restore the wallet session, validate the configured chain, then enter home.
- 已有 Token 且检测到 Provider：恢复钱包会话、校验目标网络，再进入首页。
- No token with a detected provider: connect the wallet and sign. Development uses a temporary local token only when `VITE_BASE_URL` is blank; once a development API URL is configured, or in every production build, the flow calls the address-login API normally.
- 没有 Token 且检测到 Provider：连接钱包并签名。仅开发环境且 `VITE_BASE_URL` 为空时使用临时本地 Token；开发环境配置接口地址后，以及所有生产构建中，均正常请求地址登录接口。
- In `hybrid` mode, Flutter or a regular browser without an injected provider opens the email/password login page.
- 在 `hybrid` 模式中，Flutter 或普通浏览器未检测到注入 Provider 时跳转账号密码登录页。

## Unified lifecycle methods

Both login methods call `completeLogin(token)` after the API succeeds; it stores the token, syncs the Store, then replaces the route with home.

两个登录方式在接口成功后都调用 `completeLogin(token)`；它会保存 Token、同步 Store，并替换跳转首页。

An empty production `VITE_BASE_URL` intentionally keeps API requests on the current site origin. It must not activate the development temporary-token path.

生产环境的 `VITE_BASE_URL` 留空表示接口请求使用当前网站同源地址，不能因此启用开发阶段的临时 Token 流程。

Every logout path calls `logout()`; it runs registered session cleanups, clears the token, syncs the Store, then replaces the route with splash.

所有退出场景都调用 `logout()`；它会停止已注册的登录态清理项、清除 Token、同步 Store，并替换跳转开屏页。

In an injected-wallet environment, `logout()` also clears the cached wallet address. HTTP requests always include the old project's `Address` header: an injected-wallet environment sends its current cached address, while Flutter and regular browsers without a wallet send an empty string.

在注入钱包环境中，`logout()` 还会清除钱包地址缓存。请求始终沿用旧项目的 `Address` 请求头：注入钱包环境传当前缓存地址，未注入钱包的 Flutter 与普通浏览器传空字符串。

When a project needs extra post-login or post-logout work, add it to these two methods instead of duplicating it in pages, HTTP interceptors, or wallet listeners.

以后项目有额外的登录后或退出后逻辑，直接补在这两个方法中，不要分散写在页面、请求拦截器或钱包监听里。

## DApp listener rules

Account and chain listeners are created only after a DApp session is authenticated or restored, and every creation removes the old pair first.

DApp 认证成功或恢复已有 DApp 会话后，才会创建账户和网络监听；每次创建前都会先移除旧监听。

When application code switches to the configured chain, the matching `chainChanged` event is marked as controlled and does not log out; a user account or chain change calls unified `logout()`.

代码主动切到配置网络时会标记为受控切链，匹配的 `chainChanged` 事件不会触发退出；用户主动切账户或切网络会走统一 `logout()`。

If the user changes account or chain while a signature login request is in flight, its stale response is invalidated and cannot sign in the old account.

签名登录请求期间若用户切换账户或网络，旧请求的返回会被作废，不能把旧账户重新登录。
