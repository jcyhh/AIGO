import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

test('agent rules require exported design assets before page implementation', async () => {
    const source = await readFile('AGENTS.md', 'utf8')

    assert.match(source, /Before implementing a designed page/)
    assert.match(source, /human-exported Figma slices/)
    assert.match(source, /Do not replace missing designed assets with CSS drawings/)
    assert.match(source, /Decorative design slices do not require `alt`/)
    assert.match(source, /pause page implementation/)
    assert.match(source, /`src\/assets\/<page-name>\/`/)
    assert.match(source, /`public\/brand\/`/)
})

test('template feedback records the page asset preparation workflow', async () => {
    const source = await readFile('docs/template-react-feedback.md', 'utf8')

    assert.match(source, /TRF-023：设计稿页面开发前必须先准备切图资源/)
    assert.match(source, /人工从 Figma 导出页面所需 PNG\/SVG\/WebP 切图/)
    assert.match(source, /不得擅自用 CSS、文字、emoji 或临时符号替代/)
    assert.match(source, /装饰性设计切图不强制要求编写 `alt`/)
    assert.match(source, /页面专属资源放在 `src\/assets\/<page-name>\/`/)
})

test('agent rules require a Figma implementation checklist before page code', async () => {
    const source = await readFile('AGENTS.md', 'utf8')

    assert.match(source, /Before implementing a page from a Figma link/)
    assert.match(source, /do not write code immediately/)
    assert.match(source, /implementation checklist/)
    assert.match(source, /reusable components/)
    assert.match(source, /reusable style classes/)
    assert.match(source, /reusable mixins/)
    assert.match(source, /`src\/styles\/mixins\.scss`/)
    assert.match(source, /Use `full-btn` or `@include full-button\(\.\.\.\)`/)
    assert.match(source, /Use `auto-btn` or `@include auto-button\(\.\.\.\)`/)
    assert.match(source, /inputs use `input` or `textarea`/)
    assert.match(source, /progress uses shared progress components/)
    assert.match(source, /Static pages still implement basic local interactions/)
})

test('template feedback records the Figma implementation checklist workflow', async () => {
    const source = await readFile('docs/template-react-feedback.md', 'utf8')

    assert.match(source, /TRF-024：Figma 页面生成必须先做实现清单再写代码/)
    assert.match(source, /不能直接写页面代码/)
    assert.match(source, /输出一份实现清单供开发者确认/)
    assert.match(source, /`src\/styles\/mixins\.scss`/)
    assert.match(source, /通栏主操作按钮默认使用 `full-btn` 或 `@include full-button\(\.\.\.\)`/)
    assert.match(source, /内容自适应按钮默认使用 `auto-btn` 或 `@include auto-button\(\.\.\.\)`/)
    assert.match(source, /输入区域必须使用 `input` 或 `textarea`/)
    assert.match(source, /进度展示优先使用公共进度组件/)
})

test('template feedback records that static pages still need basic interactions', async () => {
    const source = await readFile('docs/template-react-feedback.md', 'utf8')

    assert.match(source, /TRF-025：静态页面也要实现基础本地交互/)
    assert.match(source, /静态数据不等于无交互截图/)
    assert.match(source, /tab 切换、输入框、展开收起、弹窗开关/)
})
