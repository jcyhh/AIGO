import test from 'node:test'
import assert from 'node:assert/strict'

import { getAssetLogs } from '../src/features/asset/api.ts'
import { getBanners } from '../src/features/banner/api.ts'
import { createClaim } from '../src/features/claim/api.ts'
import { getRemoteConfig } from '../src/features/remoteConfig/api.ts'
import {
    getOrderRewardLogs,
    getOrders,
} from '../src/features/order/api.ts'
import {
    getNoticeById,
    getNoticeByType,
    getNotices,
    getPopNotice,
    markNoticeRead,
} from '../src/features/notice/api.ts'
import { getSwapLogs } from '../src/features/swap/api.ts'
import {
    getCurrentUser,
    getCurrentUserStatistics,
    getUserReferrals,
} from '../src/features/user/api.ts'
import { httpClient } from '../src/services/http/client.ts'

function createResponse(config) {
    if (config.url === '/api/users/my') {
        return {
            id: 1,
            address: '0xabc',
            created_at: '2026-07-20 12:00:00',
            balance_xo: '100.000000',
            level: {
                id: 1,
                icon: 'https://img.test/level.png',
                withdraw_fee: '0.05',
                withdraw_avt_fee: '0.03',
                name: 'V1',
            },
        }
    }

    if (config.url === '/api/users/my/statistics') {
        return {
            referral_count: 1,
            team_count: 2,
            kpi: '10',
            total_kpi: '20',
            team_kpi: '30',
            total_team_kpi: '40',
        }
    }

    if (config.url === '/api/users/my/referrals') {
        return { referrals: [] }
    }

    if (config.url === '/api/asset_logs') {
        return { asset_logs: [] }
    }

    if (config.url === '/api/claims') {
        return {
            id: 8,
            token: '0xtoken',
            amount: '1000000000000000000',
            signature: '0xsig',
            expire_time: 1_785_800_000,
        }
    }

    if (config.url === '/api/orders') {
        return { orders: [] }
    }

    if (config.url === '/api/orders/reward_logs') {
        return { reward_logs: [] }
    }

    if (config.url === '/api/swap_logs') {
        return { swap_logs: [] }
    }

    if (config.url === '/api/notices') {
        return { notices: [] }
    }

    if (config.url === '/api/notices/7') {
        return {
            id: 7,
            title: '公告',
            content: '<p>content</p>',
            updated_at: '2026-07-20 12:00:00',
        }
    }

    if (config.url === '/api/notices/help_center') {
        return {
            id: 9,
            title: '帮助',
            content: '<p>help</p>',
            updated_at: '2026-07-20 12:00:00',
        }
    }

    if (config.url === '/api/notices/pop') {
        return { is_show: false, notice: [] }
    }

    if (config.url === '/api/notices/7/read') {
        return {}
    }

    if (config.url === '/api/banners') {
        return { banners: [] }
    }

    if (config.url === '/api/config/config') {
        return {
            link_eco: 'https://example.test/eco',
            link_gamefi: 'https://example.test/gamefi',
            link_airdrop: 'https://example.test/airdrop',
            link_mall: 'https://example.test/mall',
            link_pool: 'https://example.test/pool',
        }
    }

    throw new Error(`Unexpected request: ${config.url}`)
}

function parseRequestData(data) {
    if (typeof data !== 'string') return data

    try {
        return JSON.parse(data)
    } catch {
        return data
    }
}

test('project external APIs map API.md endpoints through feature modules', async () => {
    const requests = []
    const previousAdapter = httpClient.defaults.adapter

    httpClient.defaults.adapter = async (config) => {
            requests.push({
                method: config.method,
                url: config.url,
                params: config.params,
                data: parseRequestData(config.data),
            })

        return {
            data: createResponse(config),
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
        }
    }

    try {
        const user = await getCurrentUser()
        const statistics = await getCurrentUserStatistics()
        const referrals = await getUserReferrals({ page_no: 1, page_size: 20 })
        const assetLogs = await getAssetLogs({
            page_no: 1,
            page_size: 20,
            ccy: 'balance_xo',
        })
        const claim = await createClaim({
            ccy: 'balance_xo',
            amount: '12.34',
        })
        const activeOrders = await getOrders({ status: 1 })
        const finishedOrders = await getOrders({
            status: 0,
            page_no: 1,
            page_size: 20,
        })
        const rewardLogs = await getOrderRewardLogs({
            page_no: 1,
            page_size: 20,
            type: 1,
        })
        const swapLogs = await getSwapLogs({ page_no: 1, page_size: 20 })
        const notices = await getNotices({ page_no: 1, page_size: 20 })
        const notice = await getNoticeById(7)
        const typedNotice = await getNoticeByType('help_center')
        const popNotice = await getPopNotice()
        const readResult = await markNoticeRead(7)
        const banners = await getBanners()
        const remoteConfig = await getRemoteConfig()

        assert.equal(user.address, '0xabc')
        assert.equal(statistics.total_team_kpi, '40')
        assert.deepEqual(referrals, { referrals: [] })
        assert.deepEqual(assetLogs, { asset_logs: [] })
        assert.equal(claim.signature, '0xsig')
        assert.deepEqual(activeOrders, { orders: [] })
        assert.deepEqual(finishedOrders, { orders: [] })
        assert.deepEqual(rewardLogs, { reward_logs: [] })
        assert.deepEqual(swapLogs, { swap_logs: [] })
        assert.deepEqual(notices, { notices: [] })
        assert.equal(notice.id, 7)
        assert.equal(typedNotice.id, 9)
        assert.deepEqual(popNotice, { is_show: false, notice: [] })
        assert.deepEqual(readResult, {})
        assert.deepEqual(banners, { banners: [] })
        assert.equal(remoteConfig.link_eco, 'https://example.test/eco')
        assert.equal(remoteConfig.link_gamefi, 'https://example.test/gamefi')
        assert.equal(remoteConfig.link_airdrop, 'https://example.test/airdrop')
        assert.equal(remoteConfig.link_mall, 'https://example.test/mall')
        assert.equal(remoteConfig.link_pool, 'https://example.test/pool')

        assert.deepEqual(requests, [
            { method: 'get', url: '/api/users/my', params: undefined, data: undefined },
            { method: 'get', url: '/api/users/my/statistics', params: undefined, data: undefined },
            { method: 'get', url: '/api/users/my/referrals', params: { page_no: 1, page_size: 20 }, data: undefined },
            { method: 'get', url: '/api/asset_logs', params: { page_no: 1, page_size: 20, ccy: 'balance_xo' }, data: undefined },
            { method: 'post', url: '/api/claims', params: undefined, data: { ccy: 'balance_xo', amount: '12.34' } },
            { method: 'get', url: '/api/orders', params: { status: 1 }, data: undefined },
            { method: 'get', url: '/api/orders', params: { status: 0, page_no: 1, page_size: 20 }, data: undefined },
            { method: 'get', url: '/api/orders/reward_logs', params: { page_no: 1, page_size: 20, type: 1 }, data: undefined },
            { method: 'get', url: '/api/swap_logs', params: { page_no: 1, page_size: 20 }, data: undefined },
            { method: 'get', url: '/api/notices', params: { page_no: 1, page_size: 20 }, data: undefined },
            { method: 'get', url: '/api/notices/7', params: undefined, data: undefined },
            { method: 'get', url: '/api/notices/help_center', params: undefined, data: undefined },
            { method: 'get', url: '/api/notices/pop', params: undefined, data: undefined },
            { method: 'get', url: '/api/notices/7/read', params: undefined, data: undefined },
            { method: 'get', url: '/api/banners', params: undefined, data: undefined },
            { method: 'get', url: '/api/config/config', params: undefined, data: undefined },
        ])
    } finally {
        httpClient.defaults.adapter = previousAdapter
    }
})
