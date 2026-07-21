# InfiniteScroll

触底加载组件。

`InfiniteScroll` 只负责监听底部哨兵进入视口，并在 `loading=false`、`hasMore=true` 时触发 `onLoadMore`。

组件不负责请求接口、不维护页码、不拼接列表，也不判断接口是否还有下一页。

页面应自行维护：

- 当前页码
- 列表数据
- `loading`
- `hasMore`
- 根据接口返回条数判断是否还能继续加载

适合接口不返回分页总数、只通过 `page_no` 和 `page_size` 请求下一页的移动端列表。
