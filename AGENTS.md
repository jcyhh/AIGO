# Agent Project Rules
# AI 协作项目规则

Read this file before changing code in this template.
修改本模板代码前先阅读本文件。

These rules are part of the template and should be preserved when creating new projects from it.
这些规则属于模板的一部分，基于模板创建新项目时应保留。

## Package manager
## 依赖管理

Use pnpm for dependency installation, scripts, tests, builds and lint checks.
依赖安装、脚本运行、测试、构建和 lint 检查统一使用 pnpm。

Keep `pnpm-lock.yaml` as the only package lock file.
只保留 `pnpm-lock.yaml` 作为依赖锁文件。

Do not create or commit `package-lock.json` or `yarn.lock`.
不要创建或提交 `package-lock.json` 或 `yarn.lock`。

Keep the package-manager guard enabled so npm and yarn fail fast.
保留包管理器校验脚本，让 npm 和 yarn 尽早失败。

## Production API origin
## 生产接口地址

Keep `VITE_BASE_URL` empty in `.env.production`.
`.env.production` 中的 `VITE_BASE_URL` 必须保持为空。

Production API requests must use relative `/api/...` paths against the current site origin.
生产接口请求必须使用相对 `/api/...` 路径并访问当前网站同源地址。

Do not write a production API domain into source code or production env.
不要在源码或生产环境变量中填写正式接口域名。

Keep `VITE_RPC_URL` empty in `.env.production` because production uses `DAPP_PRODUCTION_CHAIN` and does not read the local-chain RPC setting.
`.env.production` 中的 `VITE_RPC_URL` 必须保持为空，因为生产环境使用 `DAPP_PRODUCTION_CHAIN`，不会读取本地测试链 RPC 配置。

These rules do not apply to `.env.development`, which may use a LAN API URL and local-chain RPC URL during integration.
这些规则不适用于 `.env.development`，开发联调时可以填写局域网接口地址和本地测试链 RPC 地址。

## Import paths
## 引入路径

Use relative imports for files in the same directory or nearby parent directories.
同目录或较近上级目录的文件可以使用相对路径。

`./`, `../` and `../../` are acceptable.
可以接受 `./`、`../` 和 `../../`。

Use the `@/` alias once an import would need three or more parent jumps.
当引入路径需要三级或更多上级跳转时，必须使用 `@/` 别名。

Do not write imports such as `../../../services/...`.
不要写 `../../../services/...` 这类引入。

Use `@/services/...`, `@/shared/...`, `@/router/...`, `@/assets/...` instead.
改用 `@/services/...`、`@/shared/...`、`@/router/...`、`@/assets/...`。

## Page modules
## 页面模块

Treat each route page as a small module directory.
把每个路由页面当成一个小模块目录。

A normal page should start with a `PageName.tsx` file and a `PageName.scss` file.
普通页面通常从 `PageName.tsx` 和 `PageName.scss` 两个文件开始。

Keep same-directory page helpers next to the page and import them with `./`.
页面同目录辅助逻辑放在页面旁边，并使用 `./` 引入。

Use optional files only when the page needs them, such as `types.ts`, `utils.ts`, `service.ts` or `components/`.
仅在页面需要时增加 `types.ts`、`utils.ts`、`service.ts` 或 `components/` 等可选文件。

## Figma page implementation workflow
## Figma 页面生成流程

Before implementing a page from a Figma link, do not write code immediately.
根据 Figma 链接开发页面前，不要直接开始写代码。

First inspect the design and the current project, then provide an implementation checklist for developer confirmation.
先分析设计稿和当前项目，再输出实现清单给开发者确认。

The checklist must include required exported assets, semantic UI elements, reusable components, reusable style classes, reusable mixins and page-specific exceptions.
清单必须包含所需切图资源、语义化 UI 元素、可复用组件、可复用样式类、可复用 mixin 以及页面特例。

Check existing components, `src/styles`, `src/styles/mixins.scss`, showcase pages and nearby page implementations before adding new page SCSS.
新增页面私有 SCSS 前，先检查已有组件、`src/styles`、`src/styles/mixins.scss`、演示页面和相近页面实现。

Buttons must reuse the existing button structure when possible.
按钮应优先复用已有按钮结构。

Project primary button skin is controlled by `--app-btn-bg` and `--app-btn-color`.
项目主按钮皮肤由 `--app-btn-bg` 和 `--app-btn-color` 控制。

Use `full-btn` or `@include full-button(...)` for full-width primary action buttons.
通栏主操作按钮使用 `full-btn` 或 `@include full-button(...)`。

Use `auto-btn` or `@include auto-button(...)` for content-width buttons.
内容自适应按钮使用 `auto-btn` 或 `@include auto-button(...)`。

Only write page-specific button structure when the design explicitly requires a shape, image background or interaction that the shared button structures cannot express.
只有设计明确需要共享按钮结构无法表达的形状、图片背景或交互时，才写页面专属按钮结构。

Map visual controls to semantic elements before styling them: inputs use `input` or `textarea`, actions use `button`, links use route/navigation helpers, and progress uses shared progress components when available.
样式实现前先确认控件语义：输入区使用 `input` 或 `textarea`，操作使用 `button`，跳转使用路由/导航封装，进度展示优先使用已有进度组件。

Static pages still implement basic local interactions when the design includes interactive controls, such as tab switching, inputs, expand-collapse areas, popups and copy buttons.
静态页面如果设计里包含交互控件，仍应实现基础本地交互，例如 tab 切换、输入框、展开收起、弹窗开关和复制按钮。

If the checklist is incomplete or required assets are missing, pause and report the gap instead of filling it with improvised CSS or placeholder markup.
如果清单不完整或必需资源缺失，应暂停并报告缺口，不要用临时 CSS 或占位结构硬补。

## Styles
## 样式

Use SCSS for page styles.
页面样式使用 SCSS。

React has no Vue-style `scoped`, so page styles should start from a page-level class prefix.
React 没有 Vue 的 `scoped`，页面样式应从页面级类名前缀开始。

Prefer names like `.splash-page`, `.home-page` and nested element classes under them.
优先使用 `.splash-page`、`.home-page` 这类页面根类名，并在其下编写子元素类名。

Reuse existing global utility classes from `src/styles` before writing new page CSS.
编写新的页面 CSS 前，优先复用 `src/styles` 中已有的全局工具类。

If a visual result can be built by combining existing utility classes, compose those classes in `className` instead of adding a custom selector.
如果某个视觉效果可以通过组合已有通用类实现，就在 `className` 中组合这些类，不要额外新增自定义选择器。

If a style already exists as a utility class, put that class directly in `className`.
如果某个样式已经有对应工具类，直接把该类写到 `className` 中。

Do not duplicate utility styles in page or component SCSS.
不要在页面或组件 SCSS 中重复编写已有工具类的等价样式。

Only write custom SCSS for styles that are genuinely page-specific or hard to express with utilities, such as special positioning, unusual shapes, complex backgrounds, state selectors, animations or component internals.
只有确实属于页面特有、或很难用通用类表达的样式才写自定义 SCSS，例如特殊定位、特殊形状、复杂背景、状态选择器、动画或组件内部结构。

Stylelint rejects declarations outside `src/styles` when the same value already has a generated global utility class. Move the suggested class into JSX `className` instead of disabling the rule.
当 `src/styles` 之外的声明已经有等价的全局工具类时，Stylelint 会直接报错。应把提示的工具类移入 JSX `className`，不要禁用该规则。

Run `pnpm stylelint` to check all SCSS files. `pnpm lint` runs both Oxlint and Stylelint.
使用 `pnpm stylelint` 检查全部 SCSS；`pnpm lint` 会同时运行 Oxlint 和 Stylelint。

JSX `style` attributes are forbidden in all TSX files, including object literals, variables and dynamic expressions. Define dynamic visual states as classes in the component or page SCSS file and switch them through `className`.
所有 TSX 文件都禁止使用 JSX `style` 属性，包括对象字面量、变量和动态表达式。动态视觉状态必须在组件或页面 SCSS 中定义为类，并通过 `className` 切换。

Do not bypass PostCSS viewport conversion with numeric React styles or pixel strings in TSX. Run `pnpm lint:tsx-styles` to check this rule; `pnpm lint` includes it.
不要在 TSX 中使用 React 数字样式或 px 字符串绕过 PostCSS 视口转换。使用 `pnpm lint:tsx-styles` 检查该规则；`pnpm lint` 已包含此检查。

Every private SCSS declaration using `vh` or `vw`, including values inside `calc()`, must be immediately followed by the same property and value using `dvh` or `dvw`. Keep the legacy unit first as the compatibility fallback and the dynamic unit second as the override.
私有 SCSS 中所有使用 `vh` 或 `vw` 的声明，包括 `calc()` 内的单位，都必须紧接同属性的 `dvh` 或 `dvw` 写法。传统单位在前作为兼容回退，动态单位在后覆盖。

TSX strings and templates using `vh` or `vw` must include a matching `dvh` or `dvw` value in the same file. Stylelint and `pnpm lint:tsx-styles` enforce these rules.
TSX 字符串或模板中使用 `vh`、`vw` 时，同一文件必须提供对应的 `dvh`、`dvw` 值。Stylelint 和 `pnpm lint:tsx-styles` 会强制检查。

All custom lint rules apply only to first-party template and project source. Do not modify third-party packages to satisfy project conventions. `node_modules/**`, `src/vendor/**` and `src/third-party/**` are excluded from these checks.
所有自定义检查规则只约束模板自身和项目追加的一方代码。不要为了满足项目规范而修改第三方库；`node_modules/**`、`src/vendor/**` 和 `src/third-party/**` 均排除在检查范围外。

Place vendored third-party or generated source under `src/vendor` or `src/third-party` so the ownership boundary stays explicit. Project-written wrappers around third-party libraries remain first-party code and must follow all project rules.
复制进项目的第三方或生成源码统一放在 `src/vendor` 或 `src/third-party`，明确代码归属边界。项目自行编写的第三方库封装仍属于一方代码，必须遵守全部项目规范。

For example, use `className="flex items-center justify-center tc size-24"` instead of rewriting the same flex, alignment, text-align or font-size CSS.
例如，使用 `className="flex items-center justify-center tc size-24"`，不要重复编写同等的 flex、对齐、文本居中或字号 CSS。

## Terminology
## 术语

Keep project-facing copy consistent with the confirmed business glossary.
面向项目用户的文案必须遵循已确认的业务术语表。

For AIGO token withdrawal/redeem actions, use `提取`.
AIGO 中 Token 取回/领取类动作统一使用 `提取`。

Do not use `提现` for the same action in UI source, even if an old design draft or exported Figma node contains that wording.
同一动作不要在 UI 源码中使用 `提现`，即使旧设计稿或导出的 Figma 节点里出现该词也要按项目术语修正。

When a design file and project glossary disagree, follow the project glossary and record the mismatch in the implementation notes or feedback document.
当设计稿与项目术语表不一致时，优先遵循项目术语表，并在实现说明或反馈文档中记录差异。

## Editor tools
## 编辑器工具

VS Code users should install `IntelliSense for CSS class names in HTML` by `Zignd`.
VS Code 用户建议安装 `Zignd` 的 `IntelliSense for CSS class names in HTML`。

This extension provides class name suggestions in `className`, including SCSS utility classes from `src/styles`.
这个插件用于在 `className` 中提示样式类名，包括 `src/styles` 中的 SCSS 工具类。

If suggestions do not appear, make sure the extension is enabled globally and run `Cache CSS class definitions`.
如果没有提示，确认插件已全局启用，然后执行 `Cache CSS class definitions`。

## Assets
## 资源

Use semantic asset names instead of numeric names.
资源命名使用语义化名称，不使用数字名称。

Good examples are `splash-logo.png`, `token-usdt.png` and `home-banner.png`.
推荐示例：`splash-logo.png`、`token-usdt.png`、`home-banner.png`。

Use SVG for clean icons and vector graphics when available.
干净的图标和矢量图优先使用 SVG。

Use PNG or WebP for complex raster images, screenshots, glow effects and exported design slices.
复杂位图、截图、发光效果和设计稿切图使用 PNG 或 WebP。

Before implementing a designed page, confirm that required exported page assets are already available in the project.
开发设计稿页面前，先确认页面所需切图资源已经放入项目。

Prefer human-exported Figma slices for complex images, decorative frames, glow effects, page backgrounds and non-trivial icons.
复杂图片、装饰边框、光效、页面背景和非常规图标优先使用人工从 Figma 导出的切图。

Decorative design slices do not require `alt`; do not treat missing `alt` on page artwork as a blocking issue.
装饰性设计切图不强制要求编写 `alt`；不要把页面视觉图缺少 `alt` 当作阻塞问题。

Do not replace missing designed assets with CSS drawings, text, emoji or temporary symbols unless the developer explicitly asks for a placeholder prototype.
缺少设计资源时，不要擅自用 CSS 绘制、文字、表情或临时符号顶替，除非开发者明确要求先做占位原型。

If required assets are missing, pause page implementation and list the missing semantic asset names and suggested target paths.
如果必需资源缺失，应暂停页面实现，并列出缺少的语义化资源名和建议放置路径。

Place page-specific assets under `src/assets/<page-name>/`; keep initialization brand assets under `public/brand/`.
页面专属资源放在 `src/assets/<page-name>/`；初始化品牌资源继续放在 `public/brand/`。

## Verification
## 验证

Run tests, build and lint before claiming a change is complete.
声明改动完成前需要运行测试、构建和 lint。

At minimum, run `pnpm test`, `pnpm build` and `pnpm lint`.
至少运行 `pnpm test`、`pnpm build` 和 `pnpm lint`。

`pnpm build` is a hard quality gate: its prebuild lifecycle runs `pnpm verify`, which runs lint and tests before TypeScript and Vite can emit production assets. Do not bypass or remove this lifecycle.
`pnpm build` 是强制质量门禁：prebuild 生命周期会先运行 `pnpm verify`，由它执行 lint 和测试，全部通过后 TypeScript 和 Vite 才能生成生产产物。不得绕过或删除该生命周期。

## Test design
## 测试设计

Test stable business behavior and module contracts, not incidental presentation values or human-maintained file ordering.
测试稳定的业务行为和模块契约，不测试偶然的展示数值或人工维护的文件排序。

For configurable settings, verify that code reads the setting and behaves consistently with its current value. Do not hard-code a chosen size, color, switch value, env field list, or env order unless it is an explicit immutable requirement.
对于可配置项，验证代码确实读取该设置且行为与当前值一致。除非用户明确要求其不可变，否则不要写死尺寸、颜色、开关值、env 字段清单或 env 排序。
