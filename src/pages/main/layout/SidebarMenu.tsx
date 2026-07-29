import {
    useEffect,
    useState,
    type MouseEvent,
} from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router'

import { Popup } from '@/components/Popup'

import { Icon } from '@/components/Icon'
import { message } from '@/components/Message'
import { getRemoteConfig } from '@/features/remoteConfig/api.ts'
import type { RemoteConfigResponse } from '@/features/remoteConfig/types.ts'
import { getCurrentUserStatistics } from '@/features/user/api.ts'
import { copyTextToClipboard } from '@/shared/clipboard/copyTextToClipboard.ts'
import { formatAmount } from '@/shared/formatters/formatAmount.ts'
import {
    REFERRAL_INVITE_PLACEHOLDER,
    buildReferralInviteLink,
} from '@/features/referral/status.ts'
import { useDappStore } from '@/stores/dapp/index.ts'
import { useUserStore } from '@/stores/user/index.ts'
import copyImg from '@/assets/layout/sidebar/copy.png'
import sidebarEcoIcon from '@/assets/layout/sidebar/sidebar-eco.png'
import sidebarGamefiIcon from '@/assets/layout/sidebar/sidebar-gamefi.png'
import sidebarAirdropIcon from '@/assets/layout/sidebar/sidebar-airdrop.png'
import sidebarMallIcon from '@/assets/layout/sidebar/sidebar-mall.png'
import sidebarPoolIcon from '@/assets/layout/sidebar/sidebar-pool.png'

import { MAIN_PAGE_ITEMS } from '../config.ts'
import { AppBrand } from './AppBrand/AppBrand.tsx'

const getMenuLinkClassName = ({ isActive }: { isActive: boolean }): string =>
    [
        'app-menu__item',
        'app-menu__link',
        'flex',
        'flex-column',
        'items-center',
        'justify-center',
        isActive ? 'app-menu__link--active blue' : '',
    ].filter(Boolean).join(' ')

type SidebarExternalLinkConfigKey =
    | 'link_eco'
    | 'link_gamefi'
    | 'link_airdrop'
    | 'link_mall'
    | 'link_pool'

type SidebarExternalLinkItem = {
    titleKey: string
    icon: string
    configKey: SidebarExternalLinkConfigKey
}

const SIDEBAR_EXTERNAL_LINK_ITEMS: readonly SidebarExternalLinkItem[] = [
    {
        titleKey: 'nav.eco',
        icon: sidebarEcoIcon,
        configKey: 'link_eco',
    },
    {
        titleKey: 'nav.gamefi',
        icon: sidebarGamefiIcon,
        configKey: 'link_gamefi',
    },
    {
        titleKey: 'nav.airdrop',
        icon: sidebarAirdropIcon,
        configKey: 'link_airdrop',
    },
    {
        titleKey: 'nav.mall',
        icon: sidebarMallIcon,
        configKey: 'link_mall',
    },
    {
        titleKey: 'nav.pool',
        icon: sidebarPoolIcon,
        configKey: 'link_pool',
    },
]

function getExternalLinkClassName(linkHref: string | undefined): string {
    return [
        'app-menu__item',
        'app-menu__external',
        'flex',
        'flex-column',
        'items-center',
        'justify-center',
        linkHref ? '' : 'app-menu__external--disabled',
    ].filter(Boolean).join(' ')
}

type SidebarMenuProps = {
    show: boolean
    onClose: () => void
}

export function SidebarMenu({
    show,
    onClose,
}: SidebarMenuProps) {
    const { t } = useTranslation()
    const walletAddress = useDappStore((state) => state.walletAddress)
    const isReferralBound = useUserStore((state) => state.isReferralBound)
    const [remoteConfig, setRemoteConfig] = useState<RemoteConfigResponse>({})
    const [totalTeamKpiText, setTotalTeamKpiText] = useState('0.00')
    const inviteLink = isReferralBound
        ? buildReferralInviteLink(walletAddress)
        : REFERRAL_INVITE_PLACEHOLDER
    const canCopyInviteLink = inviteLink !== REFERRAL_INVITE_PLACEHOLDER

    useEffect(() => {
        if (!show) return

        let isCurrent = true

        async function loadRemoteConfig() {
            try {
                const config = await getRemoteConfig()

                if (isCurrent) {
                    setRemoteConfig(config)
                }
            } catch {
                if (isCurrent) {
                    setRemoteConfig({})
                }
            }
        }

        async function loadTotalTeamKpi() {
            try {
                const statistics = await getCurrentUserStatistics()

                if (isCurrent) {
                    setTotalTeamKpiText(formatAmount(statistics.total_team_kpi))
                }
            } catch {
                if (isCurrent) {
                    setTotalTeamKpiText('0.00')
                }
            }
        }

        void loadRemoteConfig()
        void loadTotalTeamKpi()

        return () => {
            isCurrent = false
        }
    }, [show])

    function handleMenuLinkClick() {
        onClose()
    }

    function handleCloseSidebarBrandClick() {
        onClose()
    }

    async function handleCopyInviteLink() {
        if (!canCopyInviteLink) return

        const copied = await copyTextToClipboard(inviteLink)

        if (copied) {
            message.success(t('复制成功'))
        }
    }

    function getSidebarExternalLinkHref(
        configKey: SidebarExternalLinkConfigKey,
    ): string | undefined {
        const value = remoteConfig[configKey]?.trim()

        return value || undefined
    }

    function handleExternalLinkClick(
        event: MouseEvent<HTMLAnchorElement>,
        linkHref: string | undefined,
    ) {
        if (!linkHref) {
            event.preventDefault()
            return
        }

        onClose()
    }

    return (
        <Popup
            show={show}
            onClose={onClose}
            position="right"
            contentPreset={false}
        >
            <aside className="app-sidebar-menu vh-100 flex flex-column" aria-label="Sidebar menu">
                <div className="flex-between">
                    <AppBrand onClick={handleCloseSidebarBrandClick} />
                    <Icon name="cross" className="size-40 opc-6" onClick={onClose} />
                </div>

                <section className="app-sidebar-kpi mt-30">
                    <div className="app-sidebar-kpi__value size-40 bold-7 word-break">
                        {totalTeamKpiText}
                    </div>
                    <div className="app-sidebar-kpi__label size-24 opc-5 mt-12">
                        {t('布道值(USDT)')}
                    </div>
                </section>

                <section className="app-sidebar-invite mt-30">
                    <div className="size-28 bold-6">{t('邀请链接')}</div>
                    <div className="app-sidebar-invite__box flex items-center mt-30">
                        <div className="app-sidebar-invite__value flex-1 size-24 opc-6 word-ellipsis-1">
                            {inviteLink}
                        </div>
                        <div className="app-sidebar-invite__line"></div>
                        <button
                            type="button"
                            className="app-sidebar-invite__copy flex-center size-36 white"
                            aria-label={t('复制邀请链接')}
                            disabled={!canCopyInviteLink}
                            onClick={() => void handleCopyInviteLink()}
                        >
                            <img src={copyImg} className="img-32" />
                        </button>
                    </div>
                </section>

                <div className="size-28 bold-6 mt-80">{t('服务')}</div>

                <nav className="app-menu scroll-y mt-50">
                    <div className="app-menu__grid">
                        {MAIN_PAGE_ITEMS.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={getMenuLinkClassName}
                                onClick={handleMenuLinkClick}
                            >
                                {({ isActive }) => (
                                    <>
                                        <img
                                            src={isActive ? item.activeIcon : item.icon}
                                            className="img-44 flex-none"
                                            alt=""
                                        />
                                        <div className="app-menu__title size-24 mt-16 tc">
                                            {t(item.titleKey)}
                                        </div>
                                    </>
                                )}
                            </NavLink>
                        ))}

                        {SIDEBAR_EXTERNAL_LINK_ITEMS.map((item) => {
                            const linkHref = getSidebarExternalLinkHref(item.configKey)

                            return (
                                <a
                                    key={item.configKey}
                                    href={linkHref}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-disabled={!linkHref}
                                    className={getExternalLinkClassName(linkHref)}
                                    onClick={(event) => handleExternalLinkClick(event, linkHref)}
                                >
                                    <img
                                        src={item.icon}
                                        className="img-44 flex-none"
                                        alt=""
                                    />
                                    <div className="app-menu__title size-24 mt-16 tc">
                                        {t(item.titleKey)}
                                    </div>
                                </a>
                            )
                        })}
                    </div>
                </nav>
            </aside>
        </Popup>
    )
}
