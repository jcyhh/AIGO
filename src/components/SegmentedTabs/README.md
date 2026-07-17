# SegmentedTabs

`SegmentedTabs` 用于同级状态切换，最多 3 项，不滚动。

选中态由组件内部滑块完成，位置通过 class 控制，不使用 JSX `style`。

```tsx
<SegmentedTabs
    options={[
        { label: '进行中', value: 'active' },
        { label: '已完成', value: 'completed' },
    ]}
    value={activeStatus}
    onChange={setActiveStatus}
    ariaLabel="订单状态"
/>
```
