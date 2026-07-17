import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const sidebarSource = await readFile(
    'src/pages/main/layout/SidebarMenu.tsx',
    'utf8',
)
const layoutSource = await readFile(
    'src/pages/main/layout/MainLayout.tsx',
    'utf8',
)

test('sidebar menu is a right popup controlled by the main layout', () => {
    assert.match(sidebarSource, /import \{ Popup \} from '@\/components\/Popup'/)
    assert.match(sidebarSource, /type SidebarMenuProps/)
    assert.match(sidebarSource, /show: boolean/)
    assert.match(sidebarSource, /onClose: \(\) => void/)
    assert.match(sidebarSource, /<Popup/)
    assert.match(sidebarSource, /show=\{show\}/)
    assert.match(sidebarSource, /onClose=\{onClose\}/)
    assert.match(sidebarSource, /position="right"/)
    assert.match(sidebarSource, /contentPreset=\{false\}/)

    assert.match(layoutSource, /useState/)
    assert.match(layoutSource, /const \[showSidebarMenu, setShowSidebarMenu\] = useState\(false\)/)
    assert.match(layoutSource, /function handleOpenSidebarMenu\(\)/)
    assert.match(layoutSource, /setShowSidebarMenu\(true\)/)
    assert.match(layoutSource, /function handleCloseSidebarMenu\(\)/)
    assert.match(layoutSource, /setShowSidebarMenu\(false\)/)
    assert.match(layoutSource, /<SidebarMenu/)
    assert.match(layoutSource, /show=\{showSidebarMenu\}/)
    assert.match(layoutSource, /onClose=\{handleCloseSidebarMenu\}/)
})

test('sidebar menu reuses the shared first-level layout menu items', () => {
    assert.match(sidebarSource, /MAIN_PAGE_ITEMS\.map/)
    assert.match(sidebarSource, /key=\{item\.path\}/)
    assert.match(sidebarSource, /to=\{item\.path\}/)
    assert.match(sidebarSource, /\{item\.title\}/)
    assert.match(sidebarSource, /onClick=\{handleMenuLinkClick\}/)
    assert.match(sidebarSource, /function handleMenuLinkClick\(\)/)
    assert.match(sidebarSource, /handleMenuLinkClick[\s\S]*onClose\(\)/)
})

test('sidebar menu renders the project invite link copy area', () => {
    assert.match(sidebarSource, /copyTextToClipboard/)
    assert.match(sidebarSource, /import copyImg from '@\/assets\/layout\/sidebar\/copy\.png'/)
    assert.match(sidebarSource, /SIDEBAR_INVITE_LINK/)
    assert.match(sidebarSource, /邀请链接/)
    assert.match(sidebarSource, /\{SIDEBAR_INVITE_LINK\}/)
    assert.match(sidebarSource, /function handleCopyInviteLink\(\)/)
    assert.match(sidebarSource, /void copyTextToClipboard\(SIDEBAR_INVITE_LINK\)/)
    assert.match(sidebarSource, /aria-label="复制邀请链接"/)
    assert.match(sidebarSource, /src=\{copyImg\}/)
    assert.match(sidebarSource, /className="img-32"/)
})

test('sidebar menu uses the shared icon pair and active project blue color', () => {
    assert.match(sidebarSource, /app-menu__link--active blue/)
    assert.match(sidebarSource, /\{\(\{ isActive \}\) =>/)
    assert.match(sidebarSource, /src=\{isActive \? item\.activeIcon : item\.icon\}/)
    assert.match(sidebarSource, /className="img-40"/)
    assert.match(sidebarSource, /<Icon\s+name="arrow"[\s\S]*className=\{isActive \? 'size-28' : 'size-28 opc-6'\}/)
    assert.doesNotMatch(sidebarSource, />title</)
})

test('sidebar menu renders the shared app brand in its header area', () => {
    assert.match(sidebarSource, /import \{ AppBrand \} from '\.\/AppBrand\/AppBrand\.tsx'/)
    assert.match(sidebarSource, /function handleCloseSidebarBrandClick\(\)/)
    assert.match(sidebarSource, /handleCloseSidebarBrandClick[\s\S]*onClose\(\)/)
    assert.match(sidebarSource, /<div className="flex-between">[\s\S]*<AppBrand onClick=\{handleCloseSidebarBrandClick\} \/>[\s\S]*<Icon/)
})

test('sidebar menu cross icon closes the popup', () => {
    assert.match(
        sidebarSource,
        /<Icon\s+name="cross"(?:(?!\/>)[\s\S])*onClick=\{onClose\}(?:(?!\/>)[\s\S])*\/>/,
    )
})
