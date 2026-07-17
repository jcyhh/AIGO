# Storage service
存储服务。

This module centralizes common string storage values and keeps keys in module configuration.
这个模块集中管理项目通用字符串缓存，并通过模块配置统一维护 key。

```ts
STORAGE_KEY.walletAddress // WALLET_ADDRESS
STORAGE_KEY.referralCode  // REF
STORAGE_KEY.token         // TOKEN
STORAGE_KEY.language      // LANG
STORAGE_KEY.loginAccount  // ACCOUNT
```

The legacy `ACCOUNT_LIST` and `REPORT` keys are intentionally not migrated.
旧项目中的 `ACCOUNT_LIST` 和 `REPORT` 没有迁移，这是有意为之。

Import semantic methods from the storage module when using storage.
使用缓存时，从 storage 模块导入语义明确的方法。

```ts
import {
  getWalletAddress,
  setWalletAddress,
  removeWalletAddress,
} from '@/services/storage'
```

All methods are safe for SSR, private browsing mode and restricted Flutter WebViews.
所有方法都兼容 SSR、隐私模式和受限制的 Flutter WebView。

Read failures return the matching default value, while write or remove failures never interrupt the page flow.
读取失败会返回对应默认值，写入或删除失败不会中断页面流程。

The default language keeps the legacy project rule: production uses `en`, and development uses `zh-Hans`.
语言默认值保留旧项目规则：生产环境使用 `en`，开发环境使用 `zh-Hans`。

Token helpers keep TODO markers until the global auth state module is ready.
Token 方法会保留 TODO 标记，等待全局认证状态模块完成后再同步登录状态。
