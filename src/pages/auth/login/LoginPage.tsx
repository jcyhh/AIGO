import {
    type FormEvent,
    useState,
} from 'react'
import { useTranslation } from 'react-i18next'

import { loginWithPassword } from '@/features/auth/password.ts'
import { getLoginAccount } from '@/services/storage/index.ts'

import './LoginPage.scss'

export function LoginPage() {
    const { t } = useTranslation()
    const [email, setEmail] = useState(() => getLoginAccount())
    const [password, setPassword] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const [submitting, setSubmitting] = useState(false)

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setErrorMessage('')

        if (!email.trim() || !password) {
            setErrorMessage(t('请输入邮箱账号和密码'))
            return
        }

        setSubmitting(true)

        try {
            await loginWithPassword({ email, password })
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : t('登录失败'))
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <main className="login-page page-shell" data-page="login">
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    value={email}
                    placeholder={t('邮箱账号')}
                    autoComplete="email"
                    onChange={(event) => setEmail(event.target.value)}
                />
                <input
                    type="password"
                    value={password}
                    placeholder={t('密码')}
                    autoComplete="current-password"
                    onChange={(event) => setPassword(event.target.value)}
                />
                {errorMessage ? <div role="alert">{errorMessage}</div> : null}
                <button type="submit" disabled={submitting}>
                    {submitting ? t('登录中...') : t('登录')}
                </button>
            </form>
        </main>
    )
}
