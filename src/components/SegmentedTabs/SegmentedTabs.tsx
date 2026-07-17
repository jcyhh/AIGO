import type {
    ComponentPropsWithoutRef,
    ReactNode,
} from 'react'

import './SegmentedTabs.scss'

export interface SegmentedTabOption<T extends string = string> {
    label: ReactNode
    value: T
    disabled?: boolean
}

export interface SegmentedTabsProps<T extends string = string> extends Omit<
    ComponentPropsWithoutRef<'div'>,
    'children' | 'onChange' | 'style'
> {
    options: readonly SegmentedTabOption<T>[]
    value: T
    onChange: (value: T) => void
    ariaLabel?: string
}

export function SegmentedTabs<T extends string = string>({
    options,
    value,
    onChange,
    ariaLabel,
    className = '',
    ...tabsProps
}: SegmentedTabsProps<T>) {
    if (options.length > 3) {
        throw new Error('SegmentedTabs only supports up to 3 options')
    }

    const activeIndex = Math.max(0, options.findIndex((option) => option.value === value))
    const tabsClassName = [
        'segmented-tabs',
        `segmented-tabs--count-${options.length}`,
        `segmented-tabs--active-${activeIndex}`,
        className,
    ].filter(Boolean).join(' ')

    const handleTabClick = (option: SegmentedTabOption<T>) => {
        if (option.disabled) return
        onChange(option.value)
    }

    return (
        <div
            {...tabsProps}
            className={tabsClassName}
            role="tablist"
            aria-label={ariaLabel}
        >
            <div className="segmented-tabs__indicator" />
            {options.map((option) => {
                const isActive = option.value === value

                return (
                    <button
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        disabled={option.disabled}
                        className={[
                            'segmented-tabs__tab',
                            'flex-center',
                            'size-28',
                            'bold-7',
                            isActive
                                ? 'segmented-tabs__tab--active'
                                : 'segmented-tabs__tab--inactive',
                            option.disabled ? 'opc-5' : '',
                        ].join(' ')}
                        onClick={() => handleTabClick(option)}
                        key={option.value}
                    >
                        {option.label}
                    </button>
                )
            })}
        </div>
    )
}
