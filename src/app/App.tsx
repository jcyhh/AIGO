import {
    useEffect,
    useRef,
} from 'react'

import { initializeAuthenticatedDappSession } from '../features/auth/startup.ts'
import { AppRouter } from '../router/index.ts'

function AuthenticatedDappSessionBootstrap() {
    const hasStartedRef = useRef(false)

    useEffect(() => {
        if (hasStartedRef.current) return

        hasStartedRef.current = true
        void initializeAuthenticatedDappSession()
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
