import test from 'node:test'
import assert from 'node:assert/strict'

import { getBanners } from '../src/features/banner/api.ts'
import { getCurrentUser } from '../src/features/user/api.ts'
import { httpClient } from '../src/services/http/client.ts'

test('common feature APIs use the expected GET endpoints', async () => {
    const requests = []
    const previousAdapter = httpClient.defaults.adapter

    httpClient.defaults.adapter = async (config) => {
        requests.push({ method: config.method, url: config.url })

        const data = config.url === '/api/users/my'
            ? { id: 7, finance_level: 2 }
            : { banners: [{ id: 1, img_url: '/banner.png' }] }

        return { data, status: 200, statusText: 'OK', headers: {}, config }
    }

    try {
        const user = await getCurrentUser()
        const banners = await getBanners()

        assert.deepEqual(requests, [
            { method: 'get', url: '/api/users/my' },
            { method: 'get', url: '/api/banners' },
        ])
        assert.deepEqual(user, { id: 7, finance_level: 2 })
        assert.deepEqual(banners, {
            banners: [{ id: 1, img_url: '/banner.png' }],
        })
    } finally {
        httpClient.defaults.adapter = previousAdapter
    }
})
