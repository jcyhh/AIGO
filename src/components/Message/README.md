# Message
全局方法级 toast。

`Message` is a method-level global toast module for request errors, copy feedback, contract results and other app-wide feedback that is not owned by a page component.
`Message` 是方法级全局 toast 模块，适合请求错误、复制反馈、合约结果等不属于某个页面组件的反馈。

```tsx
import { message } from '@/components/Message'

message.warning('请求失败')
message.success('操作成功')
message.fail('操作失败')
message.info('处理中')
message.close()
```

Only one toast is active at a time. A new call clears the old timer and reuses the single active toast lifecycle before rendering the next message.
同一时间只显示一个 toast；新调用会清理旧计时器，并沿用单例生命周期渲染下一条消息。

The service dynamically appends a root to `document.body` and removes it after close, matching the legacy dynamic toast behavior without using `innerHTML`.
服务会动态添加根节点到 `document.body` 并在关闭后销毁，保留旧项目动态 toast 行为，但不使用 `innerHTML`。
