import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'animate.css'
import './styles/index.scss'
import App from './app/App.tsx'
import { initializeI18n } from './i18n/index.ts'

async function bootstrap(): Promise<void> {
    await initializeI18n()

    createRoot(document.getElementById('root')!).render(
        <StrictMode>
            <App />
        </StrictMode>,
    )
}

void bootstrap()
