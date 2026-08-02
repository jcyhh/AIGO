import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'

const sidebarSource = await readFile(
    'src/pages/main/layout/SidebarMenu.tsx',
    'utf8',
)
const layoutSource = await readFile(
    'src/pages/main/layout/MainLayout.tsx',
    'utf8',
)
const layoutStyles = await readFile(
    'src/pages/main/layout/MainLayout.scss',
    'utf8',
)
const remoteConfigTypes = await readFile(
    'src/features/remoteConfig/types.ts',
    'utf8',
)
const mainConfigSource = await readFile(
    'src/pages/main/config.ts',
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
    assert.match(sidebarSource, /useTranslation/)
    assert.match(sidebarSource, /\{t\(item\.titleKey\)\}/)
    assert.match(sidebarSource, /onClick=\{handleMenuLinkClick\}/)
    assert.match(sidebarSource, /function handleMenuLinkClick\(\)/)
    assert.match(sidebarSource, /handleMenuLinkClick[\s\S]*onClose\(\)/)
    assert.doesNotMatch(mainConfigSource, /生态/)
    assert.doesNotMatch(mainConfigSource, /gamefi/)
    assert.doesNotMatch(mainConfigSource, /领空投/)
    assert.doesNotMatch(mainConfigSource, /商城/)
    assert.doesNotMatch(mainConfigSource, /矿池/)
})

test('sidebar menu renders the project invite link copy area', () => {
    assert.match(sidebarSource, /copyTextToClipboard/)
    assert.match(sidebarSource, /import \{ message \} from '@\/components\/Message'/)
    assert.match(sidebarSource, /import copyImg from '@\/assets\/layout\/sidebar\/copy\.png'/)
    assert.match(sidebarSource, /useDappStore/)
    assert.match(sidebarSource, /useUserStore/)
    assert.match(sidebarSource, /buildReferralInviteLink/)
    assert.match(sidebarSource, /REFERRAL_INVITE_PLACEHOLDER/)
    assert.match(sidebarSource, /const inviteLink = isReferralBound/)
    assert.match(sidebarSource, /disabled=\{!canCopyInviteLink\}/)
    assert.match(sidebarSource, /\{t\('邀请链接'\)\}/)
    assert.match(sidebarSource, /\{inviteLink\}/)
    assert.match(sidebarSource, /function handleCopyInviteLink\(\)/)
    assert.match(sidebarSource, /if \(!canCopyInviteLink\) return/)
    assert.match(sidebarSource, /const copied = await copyTextToClipboard\(inviteLink\)/)
    assert.match(sidebarSource, /if \(copied\) \{[\s\S]*message\.success\(t\('复制成功'\)\)/)
    assert.match(sidebarSource, /aria-label=\{t\('复制邀请链接'\)\}/)
    assert.match(sidebarSource, /src=\{copyImg\}/)
    assert.match(sidebarSource, /className="img-32"/)
    assert.doesNotMatch(sidebarSource, /0xalifuiewhgouerg564vbfd8sv69aa45/)
})

test('sidebar menu displays the total team KPI as the evangelism value', () => {
    assert.match(sidebarSource, /import type \{ Address \} from 'viem'/)
    assert.match(sidebarSource, /import \{ readAigoProjectTotalTeamPerformanceUsdt \} from '@\/services\/contracts'/)
    assert.match(sidebarSource, /import \{ formatDappAmountUnits \} from '@\/services\/dapp\/units\.ts'/)
    assert.match(sidebarSource, /import \{ formatAmount \} from '@\/shared\/formatters\/formatAmount\.ts'/)
    assert.match(sidebarSource, /const \[totalTeamKpiText, setTotalTeamKpiText\] = useState\('0\.00'\)/)
    assert.match(sidebarSource, /if \(!walletAddress\) \{/)
    assert.match(sidebarSource, /readAigoProjectTotalTeamPerformanceUsdt\(\s*walletAddress as Address/)
    assert.match(sidebarSource, /formatAmount\(formatDappAmountUnits\(totalTeamPerformanceUsdt\)\)/)
    assert.match(sidebarSource, /setTotalTeamKpiText\(formatAmount\(formatDappAmountUnits\(totalTeamPerformanceUsdt\)\)\)/)
    assert.match(sidebarSource, /setTotalTeamKpiText\('0\.00'\)/)
    assert.match(sidebarSource, /app-sidebar-kpi mt-30/)
    assert.match(sidebarSource, /className="app-sidebar-kpi__value size-40 bold-7 word-break"/)
    assert.doesNotMatch(sidebarSource, /app-sidebar-kpi__value size-40 bold-7 tc/)
    assert.match(sidebarSource, /\{totalTeamKpiText\}/)
    assert.match(sidebarSource, /\{t\('布道值\(USDT\)'\)\}/)
    assert.match(sidebarSource, /app-sidebar-invite mt-30/)
    assert.doesNotMatch(sidebarSource, /getCurrentUserStatistics/)
    assert.doesNotMatch(sidebarSource, /total_team_kpi/)
    assert.match(layoutStyles, /\.app-sidebar-kpi\s*\{[\s\S]*height:\s*153px[\s\S]*border-radius:\s*21px/)
    assert.match(layoutStyles, /&__value[\s\S]*color:\s*#76E6FF/)
})

test('sidebar menu shows a larger header user level icon in the evangelism card', () => {
    assert.match(sidebarSource, /const userLevel = useUserStore\(\(state\) => state\.userProfile\?\.level\)/)
    assert.match(sidebarSource, /const userLevelIcon = userLevel\?\.icon\?\.trim\(\) \?\? ''/)
    assert.match(sidebarSource, /app-sidebar-kpi__level/)
    assert.match(sidebarSource, /src=\{userLevelIcon\}/)
    assert.match(sidebarSource, /className="app-sidebar-kpi__level flex flex-column items-center justify-center flex-none ml-20"/)
    assert.match(sidebarSource, /className="img-72"/)
    assert.doesNotMatch(sidebarSource, /userLevelName/)
})

test('sidebar menu does not reload the evangelism value when it reopens for the same wallet', () => {
    assert.match(sidebarSource, /useRef/)
    assert.match(sidebarSource, /const loadedTeamKpiWalletRef = useRef<Address \| undefined>\(undefined\)/)
    assert.match(sidebarSource, /if \(loadedTeamKpiWalletRef\.current === walletAddress\) \{\s*return\s*\}/)
    assert.match(sidebarSource, /loadedTeamKpiWalletRef\.current = walletAddress/)
})

test('sidebar menu renders services as a figma-matched grid', () => {
    assert.match(sidebarSource, /app-menu__grid/)
    assert.match(sidebarSource, /app-menu__item/)
    assert.match(sidebarSource, /app-menu__link--active blue/)
    assert.match(sidebarSource, /\{\(\{ isActive \}\) =>/)
    assert.match(sidebarSource, /src=\{isActive \? item\.activeIcon : item\.icon\}/)
    assert.match(sidebarSource, /className="img-44 flex-none"/)
    assert.doesNotMatch(sidebarSource, /<Icon\s+name="arrow"/)
    assert.doesNotMatch(sidebarSource, />title</)

    assert.match(layoutStyles, /\.app-menu\s*\{[\s\S]*&__grid[\s\S]*grid-template-columns:\s*repeat\(3,\s*1fr\)/)
    assert.match(layoutStyles, /&__item/)
    assert.doesNotMatch(layoutStyles, /&__icon/)
    assert.match(layoutStyles, /&__external--disabled/)
})

test('sidebar menu renders five config-backed external service links outside first-level routes', () => {
    assert.match(sidebarSource, /import \{ getRemoteConfig \} from '@\/features\/remoteConfig\/api\.ts'/)
    assert.match(sidebarSource, /import type \{ RemoteConfigResponse \} from '@\/features\/remoteConfig\/types\.ts'/)
    assert.match(sidebarSource, /useEffect/)
    assert.match(sidebarSource, /useState/)
    assert.match(sidebarSource, /const \[remoteConfig, setRemoteConfig\] = useState<RemoteConfigResponse>\(\{\}\)/)
    assert.match(sidebarSource, /if \(!show\) return/)
    assert.match(sidebarSource, /getRemoteConfig\(\)/)
    assert.match(sidebarSource, /setRemoteConfig\(config\)/)
    assert.match(sidebarSource, /SIDEBAR_EXTERNAL_LINK_ITEMS/)
    assert.match(sidebarSource, /configKey:\s*'link_eco'/)
    assert.match(sidebarSource, /configKey:\s*'link_gamefi'/)
    assert.match(sidebarSource, /configKey:\s*'link_airdrop'/)
    assert.match(sidebarSource, /configKey:\s*'link_mall'/)
    assert.match(sidebarSource, /configKey:\s*'link_pool'/)
    assert.match(sidebarSource, /SIDEBAR_EXTERNAL_LINK_ITEMS\.map/)
    assert.match(sidebarSource, /const linkHref = getSidebarExternalLinkHref\(item\.configKey\)/)
    assert.match(sidebarSource, /href=\{linkHref\}/)
    assert.match(sidebarSource, /target="_blank"/)
    assert.match(sidebarSource, /rel="noreferrer"/)
    assert.match(sidebarSource, /aria-disabled=\{!linkHref\}/)
    assert.match(sidebarSource, /className=\{getExternalLinkClassName\(linkHref\)\}/)
    assert.doesNotMatch(sidebarSource, /app-menu__external--disabled opc-5/)
    assert.match(sidebarSource, /onClick=\{\(event\) => handleExternalLinkClick\(event, linkHref\)\}/)
    assert.match(sidebarSource, /event\.preventDefault\(\)/)
    assert.match(sidebarSource, /onClose\(\)/)
    assert.doesNotMatch(sidebarSource, /to=\{item\.href\}/)
    assert.match(sidebarSource, /SIDEBAR_EXTERNAL_LINK_ITEMS\.map\(\(item\) => \{[\s\S]*src=\{item\.icon\}/)
    assert.doesNotMatch(sidebarSource, /SIDEBAR_EXTERNAL_LINK_ITEMS\.map\(\(item\) => \{[\s\S]*isActive/)
})

test('remote config exposes typed sidebar external link fields', () => {
    assert.match(remoteConfigTypes, /export interface RemoteConfigResponse/)
    assert.match(remoteConfigTypes, /link_eco\?: string/)
    assert.match(remoteConfigTypes, /link_gamefi\?: string/)
    assert.match(remoteConfigTypes, /link_airdrop\?: string/)
    assert.match(remoteConfigTypes, /link_mall\?: string/)
    assert.match(remoteConfigTypes, /link_pool\?: string/)
})

test('sidebar external service icons use semantic asset names', () => {
    const expectedAssets = [
        'src/assets/layout/sidebar/sidebar-eco.png',
        'src/assets/layout/sidebar/sidebar-gamefi.png',
        'src/assets/layout/sidebar/sidebar-airdrop.png',
        'src/assets/layout/sidebar/sidebar-mall.png',
        'src/assets/layout/sidebar/sidebar-pool.png',
    ]

    for (const assetPath of expectedAssets) {
        assert.equal(existsSync(assetPath), true)
    }

    assert.match(sidebarSource, /sidebarEcoIcon from '@\/assets\/layout\/sidebar\/sidebar-eco\.png'/)
    assert.match(sidebarSource, /sidebarGamefiIcon from '@\/assets\/layout\/sidebar\/sidebar-gamefi\.png'/)
    assert.match(sidebarSource, /sidebarAirdropIcon from '@\/assets\/layout\/sidebar\/sidebar-airdrop\.png'/)
    assert.match(sidebarSource, /sidebarMallIcon from '@\/assets\/layout\/sidebar\/sidebar-mall\.png'/)
    assert.match(sidebarSource, /sidebarPoolIcon from '@\/assets\/layout\/sidebar\/sidebar-pool\.png'/)
    assert.doesNotMatch(sidebarSource, /link1\.png/)
    assert.doesNotMatch(sidebarSource, /link2\.png/)
    assert.doesNotMatch(sidebarSource, /link3\.png/)
    assert.doesNotMatch(sidebarSource, /link4\.png/)
    assert.doesNotMatch(sidebarSource, /link5\.png/)
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
