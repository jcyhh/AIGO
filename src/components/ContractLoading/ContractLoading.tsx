import { Popup } from '@/components/Popup'

import './ContractLoading.scss'

const LOADING_DOT_COUNT = 7
const LOADING_DOTS = Array.from({ length: LOADING_DOT_COUNT }, (_, index) => index + 1)

export interface ContractLoadingProps {
    show: boolean
    className?: string
}

export function ContractLoading({
    show,
    className = '',
}: ContractLoadingProps) {
    const loadingClassName = [
        'contract-loading',
        className,
    ].filter(Boolean).join(' ')

    return (
        <Popup
            show={show}
            position="center"
            contentPreset={false}
            closeOnOverlayClick={false}
            enterAnimation="fadeIn"
            leaveAnimation="fadeOut"
            className="contract-loading-popup"
            contentClassName="contract-loading-popup__content"
        >
            <div className={loadingClassName} aria-label="Contract loading" role="status">
                <div className="contract-loading__inner">
                    {LOADING_DOTS.map((dotIndex) => (
                        <span
                            key={dotIndex}
                            className={`contract-loading__dot contract-loading__dot--${dotIndex}`}
                        />
                    ))}
                </div>

                <svg className="contract-loading__filter" aria-hidden="true">
                    <filter id="gooey">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
                        <feColorMatrix
                            values="
                                1 0 0 0 0 
                                0 1 0 0 0
                                0 0 1 0 0 
                                0 0 0 20 -10
                            "
                        />
                    </filter>
                </svg>
            </div>
        </Popup>
    )
}
