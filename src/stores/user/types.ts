import type { UserProfile } from '../../features/user/types.ts'

export interface UserStoreState {
    isAuthenticated: boolean
    isReferralBound: boolean
    userProfile: UserProfile | undefined
    markSignedIn: () => void
    markSignedOut: () => void
    setReferralBound: (isReferralBound: boolean) => void
    setUserProfile: (userProfile: UserProfile | undefined) => void
}
