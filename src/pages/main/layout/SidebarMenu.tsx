import { NavLink } from 'react-router'

import { Popup } from '@/components/Popup'

import { Icon } from '@/components/Icon'
import { copyTextToClipboard } from '@/shared/clipboard/copyTextToClipboard.ts'
import copyImg from '@/assets/layout/sidebar/copy.png'

import { MAIN_PAGE_ITEMS } from '../config.ts'
import { AppBrand } from './AppBrand/AppBrand.tsx'

const getMenuLinkClassName = ({ isActive }: { isActive: boolean }): string =>
    isActive ? 'app-menu__link app-menu__link--active blue' : 'app-menu__link'

const SIDEBAR_INVITE_LINK = '0xalifuiewhgouerg564vbfd8sv69aa45'

type SidebarMenuProps = {
    show: boolean
    onClose: () => void
}

export function SidebarMenu({
    show,
    onClose,
}: SidebarMenuProps) {
    function handleMenuLinkClick() {
        onClose()
    }

    function handleCloseSidebarBrandClick() {
        onClose()
    }

    function handleCopyInviteLink() {
        void copyTextToClipboard(SIDEBAR_INVITE_LINK)
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
                    <Icon name="cross" className="size-48 opc-6" onClick={onClose} />
                </div>

                <section className="app-sidebar-invite mt-70">
                    <div className="size-28 bold-6">邀请链接</div>
                    <div className="app-sidebar-invite__box flex items-center mt-30">
                        <div className="app-sidebar-invite__value flex-1 size-24 opc-6 word-ellipsis-1">
                            {SIDEBAR_INVITE_LINK}
                        </div>
                        <div className='app-sidebar-invite__line'></div>
                        <button
                            type="button"
                            className="app-sidebar-invite__copy flex-center size-36 white"
                            aria-label="复制邀请链接"
                            onClick={handleCopyInviteLink}
                        >
                            <img src={copyImg} className="img-32" />
                        </button>
                    </div>
                </section>

                <div className="size-28 bold-6 mt-80">服务</div>

                <nav className="app-menu scroll-y mt-50">
                    {MAIN_PAGE_ITEMS.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={getMenuLinkClassName}
                            onClick={handleMenuLinkClick}
                        >
                            {({ isActive }) => (
                                <div className="flex-between pt-30 pb-30">
                                    <div className="flex items-center">
                                        <img
                                            src={isActive ? item.activeIcon : item.icon}
                                            className="img-40"
                                            alt=""
                                        />
                                        <div className="ml-10 size-28">{item.title}</div>
                                    </div>
                                    <Icon
                                        name="arrow"
                                        className={isActive ? 'size-28' : 'size-28 opc-6'}
                                    />
                                </div>
                            )}
                        </NavLink>
                    ))}
                </nav>
            </aside>
        </Popup>
    )
}
