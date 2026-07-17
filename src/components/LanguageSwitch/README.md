# LanguageSwitch
语言切换入口组件。

`LanguageSwitch` is the shared entry component for opening the language picker.
`LanguageSwitch` 是用于打开语言选择器的通用入口组件。

When `children` is omitted, it renders the default language icon trigger.
当不传 `children` 时，组件会渲染默认的语言图标入口。

When `children` is provided, it uses that custom content as the clickable trigger, such as a project button.
当传入 `children` 时，组件会使用自定义内容作为可点击入口，例如项目自己的按钮样式。

When `APP_CONFIG.enableI18n` is disabled, the component returns only a hidden `div`; the Picker, state and event logic are not mounted, so calling pages do not need conditional rendering.
当 `APP_CONFIG.enableI18n` 关闭时，组件只返回一个隐藏的 `div`；Picker、状态和事件逻辑都不会挂载，调用页面无需自行增加条件渲染。

The popup uses the shared `Picker` component, so it behaves like a mobile single-choice selector with a confirm button.
弹窗使用通用 `Picker` 组件，所以它是移动端常见的单选选择器，并带确认按钮。

Changing language goes through `changeAppLanguage()`, which updates i18next, localStorage, `<html lang>` and the app store together.
切换语言会统一走 `changeAppLanguage()`，它会同时更新 i18next、localStorage、`<html lang>` 和 app store。

After a new language is confirmed, the component waits for the Picker close animation to finish, then reloads the page so page-level APIs can request fresh data with the new `lang` header.
确认切换到新语言后，组件会先等待 Picker 关闭动画结束，再刷新页面，让页面级接口用新的 `lang` 请求头重新拉取数据。

`onOpen` is exposed for analytics, temporary wiring or tests.
组件保留 `onOpen`，方便埋点、临时接入或测试。

Default icon trigger:
默认图标入口：

```tsx
import { LanguageSwitch } from '@/components/LanguageSwitch'

<LanguageSwitch />
```

Custom button trigger:
自定义按钮入口：

```tsx
import { LanguageSwitch } from '@/components/LanguageSwitch'

<LanguageSwitch>
    <button type="button">切换语言</button>
</LanguageSwitch>
```
