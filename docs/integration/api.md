# API 对接摘要

## 基础约定

| 项 | 说明 |
| --- | --- |
| 请求前缀 | `/api` |
| 开发接口地址 | `.env.development` 的 `VITE_BASE_URL` |
| 生产接口地址 | `.env.production` 的 `VITE_BASE_URL` 必须留空，生产走当前域名同源 `/api/...` |
| 鉴权 | 需要登录的接口使用 `Authorization: Bearer {token}` |
| 语言 | 开启多语言时发送 `lang` 请求头 |
| 错误格式 | 非 2xx 错误 body 为纯文本错误信息，不是统一 JSON |
| 分页 | 常用 `page_no`、`page_size`，多数列表 `page_size` 为 1 ~ 20 |

## 已封装接口

| 模块 | 函数 | 方法 | 路径 | 鉴权 | 用途 |
| --- | --- | --- | --- | --- | --- |
| `auth` | `requestDappLogin` | POST | `/api/auth/login` | 否 | 钱包签名登录 |
| `user` | `getCurrentUser` | GET | `/api/users/my` | 是 | 当前用户信息 |
| `user` | `getCurrentUserStatistics` | GET | `/api/users/my/statistics` | 是 | 用户统计 |
| `user` | `getUserReferrals` | GET | `/api/users/my/referrals` | 是 | 直推列表 |
| `asset` | `getAssetLogs` | GET | `/api/asset_logs` | 是 | 资产变动记录 |
| `claim` | `createClaim` | POST | `/api/claims` | 是 | 创建提取签名 |
| `order` | `getOrders` | GET | `/api/orders` | 是 | 协作订单列表 |
| `order` | `getOrderRewardLogs` | GET | `/api/orders/reward_logs` | 是 | 订单收益记录 |
| `swap` | `getSwapLogs` | GET | `/api/swap_logs` | 是 | 闪兑记录 |
| `notice` | `getNotices` | GET | `/api/notices` | 否 | 公告列表 |
| `notice` | `getNoticeDetail` | GET | `/api/notices/{id}` | 否 | 公告详情 |
| `notice` | `getNoticeByType` | GET | `/api/notices/{type}` | 否 | 按类型获取公告 |
| `notice` | `getPopNotice` | GET | `/api/notices/pop` | 否 | 弹窗公告 |
| `notice` | `markNoticeRead` | GET | `/api/notices/{id}/read` | 否 | 标记公告已读 |
| `banner` | `getBanners` | GET | `/api/banners` | 否 | Banner 列表 |
| `remoteConfig` | `getRemoteConfig` | GET | `/api/config/config` | 否 | 后端预留配置 |

## 登录对接

- 当前钱包登录只传 `address`、`signature`、`timestamp`。
- 邀请码访问仍由 `ref` 路由缓存到本地。
- 登录接口不再传 `ref`，绑定邀请码在下单流程处理。
- 开发环境且未配置 `VITE_BASE_URL` 时，前端会使用临时 token 走静态页面和合约联调流程。
- 生产环境即使 `VITE_BASE_URL` 为空，也必须正常请求当前域名同源接口。

## 订单接口注意点

- `GET /api/orders`：
  - `status=1` 进行中订单，默认返回最新 50 条。
  - `status=0` 已结束订单，需要分页。
- `POST /api/orders` 已在原始文档出现，但后端当前控制器未实现，前端暂不封装为可用能力。

## 暂未作为前台常规能力封装

| 接口 | 说明 |
| --- | --- |
| `POST /api/uploads` | 文件上传，通用上传能力已有服务层封装，页面需要时再接 |
| `/api/test/*` | 测试或数据导入接口，不作为前台业务能力 |
| Internal API | 内部服务或后台调用，不作为 H5 前台接口 |
