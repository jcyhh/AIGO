export interface UserStoreState {
    isAuthenticated: boolean
    markSignedIn: () => void
    markSignedOut: () => void
}
