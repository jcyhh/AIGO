# ProgressBar
进度条组件。

`ProgressBar` receives the two values used for calculation, then calls `calculatePercentage()` internally.
`ProgressBar` 接收用于计算的两个数值，并在组件内部统一调用 `calculatePercentage()`。

```tsx
<ProgressBar currentValue={userAmount} totalValue={totalAmount} />

<ProgressBar
    currentValue="545"
    totalValue="1000"
    className="mt-20"
    aria-label="完成度"
/>
```

The default `solid` variant uses `--app-progress-color` for the progress color and `--app-progress-bg` for the track color.
默认 `solid` 类型使用 `--app-progress-color` 作为进度颜色，使用 `--app-progress-bg` 作为轨道颜色。

Keep page code passing business values instead of precomputed percentages, so percentage rules stay centralized in `calculatePercentage()`.
页面代码应传业务数值，不提前传百分比，确保占比规则集中在 `calculatePercentage()`。
