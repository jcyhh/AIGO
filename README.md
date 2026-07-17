# React H5 DApp Template
React 移动端 H5 DApp 模板。

This project is a learning-friendly React template for mobile-only H5 and DApp projects.
这是一个面向移动端 H5 和 DApp 项目的 React 学习模板。

The stack uses React, TypeScript, Vite, Oxlint, SCSS, PostCSS viewport conversion, React Router, Zustand, Axios and i18next.
技术栈使用 React、TypeScript、Vite、Oxlint、SCSS、PostCSS 视口转换、React Router、Zustand、Axios 和 i18next。

The template keeps most modules intentionally small so each module can be studied and replaced independently.
模板会刻意让多数模块保持较小体积，方便逐个学习和独立替换。

## Agent rules
## AI 协作规则

AI tools and collaborating engineers should read `AGENTS.md` before changing code.
AI 工具和协作工程师修改代码前应先阅读 `AGENTS.md`。

Project conventions such as import paths, page modules, styles and asset naming are recorded there.
引入路径、页面模块、样式和资源命名等项目规范都记录在其中。

## Development
## 开发命令

This template uses pnpm as the package manager.
本模板使用 pnpm 作为依赖管理工具。

pnpm keeps one global content-addressable store, which is friendlier when many projects are created from the same template.
pnpm 会复用全局内容寻址存储，对基于同一模板创建多个项目的场景更友好。

The project rejects npm and yarn for dependency installation and common scripts.
项目会拒绝使用 npm 和 yarn 安装依赖或运行常用脚本。

Install dependencies before running the project.
运行项目前先安装依赖。

```bash
pnpm install
```

Start the local development server.
启动本地开发服务。

```bash
pnpm dev
```

Build the production bundle.
构建生产包。

The build command first runs lint and tests. Any convention violation or test failure blocks the production build.
构建命令会先运行 lint 和测试；任何规范违规或测试失败都会阻止生产构建。

```bash
pnpm build
```

Run the same pre-build verification without generating a bundle.
只执行相同的构建前验证而不生成产物。

```bash
pnpm verify
```

Run the test suite.
运行测试。

```bash
pnpm test
```

Run Oxlint.
运行 Oxlint。

```bash
pnpm lint
```

## VS Code extensions
## VS Code 扩展

Install `IntelliSense for CSS class names in HTML` by `Zignd` for `className` style suggestions.
安装 `Zignd` 的 `IntelliSense for CSS class names in HTML`，用于在 `className` 中提示样式类名。

This project recommends it through `.vscode/extensions.json`.
本项目已经通过 `.vscode/extensions.json` 推荐该插件。

If the command `Cache CSS class definitions` is missing, check whether the extension is globally disabled.
如果搜不到 `Cache CSS class definitions` 命令，检查插件是否被全局禁用。

## Documentation style
## 文档风格

Module notes use English first and Chinese directly below.
模块说明采用英文在上、中文紧跟下一行的形式。

AI tools should read the English text first.
AI 工具可以优先读取英文内容。

Engineers can read the Chinese line below for the same meaning.
工程师可以阅读下方中文行来理解相同含义。

Keep tutorials and module conventions in Markdown files.
教程和模块约定应放在 Markdown 文件中。

Keep code comments focused on local reasons, TODOs and important constraints.
代码注释只解释局部原因、TODO 和重要约束。

## Mobile H5 adaptation
## 移动端 H5 适配

SCSS can be written with 750px design draft values.
SCSS 可以按照 750 设计稿直接写 px。

PostCSS converts eligible `px` values into `vw`.
PostCSS 会把符合条件的 `px` 转换成 `vw`。

When a third-party component needs real numeric pixels, use the viewport helper module.
当三方组件需要真实数字像素时，使用 viewport 辅助模块。

## Social share cards
## 社交分享卡片

Social share meta tags are disabled by default and are injected into the HTML entry only when `VITE_ENABLE_SOCIAL_META=1`.
社交分享 meta 默认关闭，只有 `VITE_ENABLE_SOCIAL_META=1` 时才会注入 HTML 入口。

Social values are configured through env variables and stay blank in the template.
社交分享值通过环境变量配置，模板中保持空值。

Fill them with public absolute URLs before a real production launch.
真实项目上线前应填写公网可访问的绝对地址。
