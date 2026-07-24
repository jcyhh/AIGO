import {
    useEffect,
    useRef,
} from 'react'

import { initializeAuthenticatedDappSession } from '../features/auth/startup.ts'
import {
    isSplashRoutePath,
    waitForSplashAnimation,
} from '../pages/splash/animation.ts'
import { AppRouter } from '../router/index.ts'

async function initializeAuthenticatedDappSessionAfterOpening(): Promise<void> {
    if (isSplashRoutePath()) {
        await waitForSplashAnimation()
    }

    await initializeAuthenticatedDappSession()
}

function AuthenticatedDappSessionBootstrap() {
    const hasStartedRef = useRef(false)

    useEffect(() => {
        if (hasStartedRef.current) return

        hasStartedRef.current = true
        void initializeAuthenticatedDappSessionAfterOpening()
    }, [])

    return null
}

function App() {
    return (
        <>
            <AuthenticatedDappSessionBootstrap />
            <AppRouter />
        </>
    )
}

export default App
