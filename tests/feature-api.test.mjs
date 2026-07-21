import test from 'node:test'
import assert from 'node:assert/strict'

import { getAssetLogs } from '../src/features/asset/api.ts'
import { getBanners } from '../src/features/banner/api.ts'
import { getOrders } from '../src/features/order/api.ts'
import { getCurrentUser } from '../src/features/user/api.ts'
import { httpClient } from '../src/services/http/client.ts'
import { useUserStore } from '../src/stores/user/store.ts'

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

test('current user API reuses one in-flight profile request', async () => {
    const requests = []
    const previousAdapter = httpClient.defaults.adapter
    useUserStore.setState({ userProfile: undefined })

    httpClient.defaults.adapter = async (config) => {
        requests.push({ method: config.method, url: config.url })

        return {
            data: {
                id: 7,
                address: '0xabc',
                created_at: '2026-07-21 12:00:00',
                balance_xo: '909.09',
                level: {
                    id: 1,
                    icon: '',
                    withdraw_fee: '0',
                    withdraw_avt_fee: '0',
                    name: 'V1',
                },
            },
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
        }
    }

    try {
        const [firstUser, secondUser] = await Promise.all([
            getCurrentUser(),
            getCurrentUser(),
        ])

        assert.deepEqual(requests, [
            { method: 'get', url: '/api/users/my' },
        ])
        assert.deepEqual(secondUser, firstUser)
        assert.deepEqual(useUserStore.getState().userProfile, firstUser)
    } finally {
        httpClient.defaults.adapter = previousAdapter
    }
})

test('asset logs API reuses one in-flight request for the same page params', async () => {
    const requests = []
    const previousAdapter = httpClient.defaults.adapter

    httpClient.defaults.adapter = async (config) => {
        requests.push({
            method: config.method,
            url: config.url,
            params: config.params,
        })

        return {
            data: {
                asset_logs: [
                    {
                        id: 1,
                        is_inc: 1,
                        amount: '12.34',
                        ccy: 'balance_xo',
                        content: '权重收益',
                        created_at: '2026-07-21 12:00:00',
                    },
                ],
            },
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
        }
    }

    try {
        const params = {
            page_no: 1,
            page_size: 20,
            ccy: 'balance_xo',
        }
        const [firstLogs, secondLogs] = await Promise.all([
            getAssetLogs(params),
            getAssetLogs(params),
        ])

        assert.deepEqual(requests, [
            {
                method: 'get',
                url: '/api/asset_logs',
                params,
            },
        ])
        assert.deepEqual(secondLogs, firstLogs)
    } finally {
        httpClient.defaults.adapter = previousAdapter
    }
})

test('orders API reuses one in-flight request for the same list params', async () => {
    const requests = []
    const previousAdapter = httpClient.defaults.adapter

    httpClient.defaults.adapter = async (config) => {
        requests.push({
            method: config.method,
            url: config.url,
            params: config.params,
        })

        return {
            data: {
                orders: [
                    {
                        id: 1,
                        index: 1,
                        amount: '10',
                        total_amount: '20',
                        release_amount: '0',
                        status: 1,
                        created_at: '2026-07-21 12:00:00',
                    },
                ],
            },
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
        }
    }

    try {
        const params = { status: 1 }
        const [firstOrders, secondOrders] = await Promise.all([
            getOrders(params),
            getOrders(params),
        ])

        assert.deepEqual(requests, [
            {
                method: 'get',
                url: '/api/orders',
                params,
            },
        ])
        assert.deepEqual(secondOrders, firstOrders)
    } finally {
        httpClient.defaults.adapter = previousAdapter
    }
})
