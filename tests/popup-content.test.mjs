import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

test('popup content exports preset content wrappers by popup position', async () => {
    const [popup, publicEntry, entry, center, bottom, styles] = await Promise.all([
        readFile('src/components/Popup/Popup.tsx', 'utf8'),
        readFile('src/components/Popup/index.ts', 'utf8'),
        readFile('src/components/Popup/PopupContent/index.ts', 'utf8'),
        readFile('src/components/Popup/PopupContent/Center.tsx', 'utf8'),
        readFile('src/components/Popup/PopupContent/Bottom.tsx', 'utf8'),
        readFile('src/components/Popup/PopupContent/PopupContent.scss', 'utf8'),
    ])

    assert.match(entry, /export \{ PopupContentCenter \} from '\.\/Center\.tsx'/)
    assert.match(entry, /export \{ PopupContentBottom \} from '\.\/Bottom\.tsx'/)
    assert.match(entry, /center:\s*PopupContentCenter/)
    assert.doesNotMatch(entry, /PopupContentSide/)
    assert.doesNotMatch(publicEntry, /PopupContentSide/)
    assert.doesNotMatch(entry, /right:/)
    assert.doesNotMatch(entry, /left:/)
    assert.match(entry, /bottom:\s*PopupContentBottom/)
    assert.match(popup, /getPopupContentComponent\(position\)/)
    assert.match(popup, /<PopupContentComponent/)
    assert.match(popup, /onClose=\{onClose\}/)
    assert.match(popup, /!PopupContentComponent/)
    assert.doesNotMatch(popup, /popupPosition=\{position\}/)
    assert.match(center, /import \{ Icon \} from '\.\.\/\.\.\/Icon'/)
    assert.match(center, /ReactNode/)
    assert.match(center, /title\?: ReactNode/)
    assert.match(center, /theme\?: PopupContentTheme/)
    assert.match(center, /useTranslation/)
    assert.match(center, /const resolvedTitle = title \?\? t\('标题'\)/)
    assert.match(center, /theme = 'default'/)
    assert.match(center, /onClose\?: \(\) => void/)
    assert.match(center, /onClose,/)
    assert.match(center, /\{resolvedTitle\}/)
    assert.match(center, /popup-content--center/)
    assert.match(center, /`popup-content--\$\{theme\}`/)
    assert.match(center, /popup-content__header/)
    assert.match(center, /popup-content__title/)
    assert.match(center, /<Icon\s+name="cross"[\s\S]*onClick=\{onClose\}/)
    assert.match(center, /\{children\}/)
    assert.match(bottom, /ReactNode/)
    assert.match(bottom, /title\?: ReactNode/)
    assert.match(bottom, /theme\?: PopupContentTheme/)
    assert.match(bottom, /useTranslation/)
    assert.match(bottom, /const resolvedTitle = title \?\? t\('标题'\)/)
    assert.match(bottom, /theme = 'default'/)
    assert.match(bottom, /onClose\?: \(\) => void/)
    assert.match(bottom, /onClose,/)
    assert.match(bottom, /\{resolvedTitle\}/)
    assert.match(bottom, /popup-content--bottom/)
    assert.match(bottom, /`popup-content--\$\{theme\}`/)
    assert.match(bottom, /<Icon\s+name="cross"[\s\S]*onClick=\{onClose\}/)
    assert.match(styles, /\.popup-content/)
    assert.match(styles, /&--gradient-card[\s\S]*@include gradient-card\(/)
    assert.match(styles, /var\(--app-popup-gradient-card-bg\)/)
    assert.match(styles, /var\(--app-popup-gradient-card-border\)/)
    assert.doesNotMatch(styles, /&--side/)
})
