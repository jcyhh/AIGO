import { setLoginAccount } from '@/services/storage/index.ts'

import { requestPasswordLogin } from './api.ts'
import { completeLogin } from './session.ts'
import type { PasswordLoginParams } from './types.ts'

export async function loginWithPassword(
    params: PasswordLoginParams,
): Promise<void> {
    const email = params.email.trim()
    const response = await requestPasswordLogin({
        email,
        password: params.password,
    })

    setLoginAccount(email)
    completeLogin(response.token)
}
