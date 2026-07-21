# Components
通用组件。

This directory stores reusable UI components that are shared by multiple business modules.
这个目录存放可被多个业务模块复用的通用 UI 组件。

Keep business-specific components inside their feature or page directory until they are reused.
业务专属组件先放在对应 feature 或页面目录中，直到确实被复用后再抽到这里。

`Message` is the shared method-level global toast module for request errors and app-wide feedback.
`Message` 是请求错误和全局反馈共用的方法级 toast 模块。

`InfiniteScroll` is the shared touch-bottom load-more trigger for paged mobile lists.
`InfiniteScroll` 是分页列表共用的触底加载触发组件。
