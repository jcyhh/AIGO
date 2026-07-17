export const HEADER_BAR_BACKGROUND_TYPE = {
    solid: 'solid',
    scrollOpacity: 'scrollOpacity',
} as const

export type HeaderBarBackgroundType =
    typeof HEADER_BAR_BACKGROUND_TYPE[keyof typeof HEADER_BAR_BACKGROUND_TYPE]

export const DEFAULT_HEADER_BACKGROUND_SCROLL_DISTANCE = 100
