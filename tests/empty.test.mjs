import test from 'node:test'
import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'

test('empty component wraps the shared no-data image and text', async () => {
    const [component, styles, entry, readme, showcasePage, showcaseStyle] = await Promise.all([
        readFile('src/components/Empty/Empty.tsx', 'utf8'),
        readFile('src/components/Empty/Empty.scss', 'utf8'),
        readFile('src/components/Empty/index.ts', 'utf8'),
        readFile('src/components/Empty/README.md', 'utf8'),
        readFile('src/showcase/components/empty/EmptyShowcasePage.tsx', 'utf8'),
        readFile('src/showcase/components/empty/EmptyShowcasePage.scss', 'utf8'),
    ])

    await access('src/assets/common/empty.png')

    assert.match(component, /useTranslation/)
    assert.match(component, /emptyUrl from '@\/assets\/common\/empty\.png'/)
    assert.match(component, /text\?:\s*ReactNode/)
    assert.match(component, /showGap\?:\s*boolean/)
    assert.match(component, /text \?\? t\('暂无数据'\)/)
    assert.match(component, /className="gap-100"/)
    assert.match(component, /empty__image/)
    assert.match(component, /empty__text/)

    assert.match(styles, /\.empty\s*\{/)
    assert.match(styles, /&__image/)
    assert.match(styles, /width:\s*204px/)
    assert.match(styles, /height:\s*210px/)

    assert.match(entry, /export \{ Empty \} from '\.\/Empty\.tsx'/)
    assert.match(readme, /暂无数据/)
    assert.match(readme, /gap-100/)
    assert.match(showcasePage, /export function EmptyShowcasePage/)
    assert.match(showcasePage, /<SecondaryHeader title="空数据" \/>/)
    assert.match(showcasePage, /<Empty \/>/)
    assert.match(showcasePage, /<Empty text="暂无收益记录" showGap=\{false\} \/>/)
    assert.match(showcaseStyle, /\.empty-showcase\s*\{/)
})
