# AIGO 对接资料

这个目录留存当前项目的后端接口和链上合约对接索引。

详细字段以原始 API 文档、ABI 和源码类型为准；这里仅记录开发联调时最常用的入口、约束和已封装范围。

## 目录

- [API 对接摘要](./api.md)
- [合约对接摘要](./contracts.md)

## 前端封装入口

| 类型 | 目录 | 说明 |
| --- | --- | --- |
| 后端接口 | `src/features` | 按业务模块封装 HTTP API、参数类型和返回类型 |
| 项目合约 | `src/services/contracts` | AIGO 项目 ABI、地址读取、读写方法封装 |
| DApp 通用能力 | `src/services/dapp` | 钱包、切链、gas、ERC20、合约读写、金额单位转换 |
| 项目代币常量 | `src/config/token.ts` | Token 和 AIGO 展示名称 |

## 联调顺序建议

1. 确认 `.env.development` 的 API、RPC、合约地址是否齐全。
2. 确认钱包已登录并完成 DApp 初始化。
3. 先接只读数据：用户信息、Token 余额、注册状态、订单列表。
4. 再接写操作：入金、提取、闪兑、复利。
5. 写合约前统一走已封装的 gas 检查和 ERC20 授权流程。
