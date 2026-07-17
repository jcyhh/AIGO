import { NavLink } from 'react-router'

import { MAIN_PAGE_ITEMS } from '../config.ts'

const TABBAR_LINK_CLASS_NAME =
    'app-tabbar__link flex-1 flex flex-column items-center justify-center size-24'

const getMenuLinkClassName = ({ isActive }: { isActive: boolean }): string =>
    isActive
        ? `${TABBAR_LINK_CLASS_NAME} app-tabbar__link--active app-color`
        : TABBAR_LINK_CLASS_NAME

export function TabbarMenu() {
    return (
        <nav>
            <div className="gap-100" />
            <div className="app-tabbar vw-100" aria-label="Tabbar menu">
                <div className="app-tabbar__bar flex">
                    {MAIN_PAGE_ITEMS.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={getMenuLinkClassName}
                        >
                            {({ isActive }) => (
                                <>
                                    <img
                                        src={isActive ? item.activeIcon : item.icon}
                                        className="img-44"
                                        alt=""
                                    />
                                    <span className={isActive ? 'mt-4' : 'mt-4 opc-5'}>
                                        {item.title}
                                    </span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>
                <div className="safe-bottom" />
            </div>
        </nav>
    )
}
