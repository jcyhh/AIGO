import { create } from 'zustand'

import { getToken } from '../../services/storage/token.ts'

import type { UserStoreState } from './types.ts'

export const useUserStore = create<UserStoreState>()((set) => ({
    isAuthenticated: Boolean(getToken()),
    markSignedIn: () => set({ isAuthenticated: true }),
    markSignedOut: () => set({ isAuthenticated: false }),
}))
