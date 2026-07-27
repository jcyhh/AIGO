import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'animate.css'
import './styles/index.scss'
import App from './app/App.tsx'
import { initializeI18n } from './i18n/index.ts'

const noopConsole = () => undefined

function disableProductionConsole(): void {
    if (!import.meta.env.PROD) {
        return
    }

    console.log = noopConsole
    console.warn = noopConsole
    console.error = noopConsole
    console.debug = noopConsole
    console.info = noopConsole
}

async function bootstrap(): Promise<void> {
    await initializeI18n()

    createRoot(document.getElementById('root')!).render(
        <StrictMode>
            <App />
        </StrictMode>,
    )
}

disableProductionConsole()

void bootstrap()
