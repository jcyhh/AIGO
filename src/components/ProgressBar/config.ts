export const PROGRESS_BAR_VARIANT = {
    solid: 'solid',
} as const

export type ProgressBarVariant =
    typeof PROGRESS_BAR_VARIANT[keyof typeof PROGRESS_BAR_VARIANT]
