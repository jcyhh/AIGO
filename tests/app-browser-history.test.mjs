import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

import {
    addAppBasenameToPathname,
    stripAppBasenameFromLocation,
    stripAppBasenameFromPathname,
} from '../src/router/appBrowserHistory.ts'

test('accepts root paths that are served outside the h5 basename', () => {
    assert.equal(stripAppBasenameFromPathname('/'), '/')
    assert.equal(stripAppBasenameFromPathname('/ref/abc'), '/ref/abc')
    assert.equal(stripAppBasenameFromPathname('/home'), '/home')
})

test('strips the h5 basename when the current URL already includes it', () => {
    assert.equal(stripAppBasenameFromPathname('/h5'), '/')
    assert.equal(stripAppBasenameFromPathname('/h5/'), '/')
    assert.equal(stripAppBasenameFromPathname('/h5/home'), '/home')
    assert.equal(stripAppBasenameFromPathname('/h5/ref/abc'), '/ref/abc')
})

test('builds browser paths with the h5 basename for app navigations', () => {
    assert.equal(addAppBasenameToPathname('/'), '/h5/')
    assert.equal(addAppBasenameToPathname('/home'), '/h5/home')
    assert.equal(addAppBasenameToPathname('/ref/abc'), '/h5/ref/abc')
    assert.equal(addAppBasenameToPathname('/h5/home'), '/h5/home')
})

test('keeps search and hash while normalizing browser locations for the router', () => {
    assert.deepEqual(
        stripAppBasenameFromLocation({
            pathname: '/h5/ref/abc',
            search: '?from=invite',
            hash: '#top',
            state: { source: 'test' },
            key: 'route-test',
        }),
        {
            pathname: '/ref/abc',
            search: '?from=invite',
            hash: '#top',
            state: { source: 'test' },
            key: 'route-test',
        },
    )
})

test('documents the loose h5 basename deployment fallback', async () => {
    const [routerReadme, feedback] = await Promise.all([
        readFile('src/router/README.md', 'utf8'),
        readFile('docs/template-react-feedback.md', 'utf8'),
    ])

    assert.match(routerReadme, /AppBrowserRouter/)
    assert.match(routerReadme, /without the `\/h5` prefix/)
    assert.match(feedback, /TRF-044：React H5 history 路由应兼容无 basename 的服务端 fallback/)
    assert.match(feedback, /BrowserRouter basename="\/h5"/)
})
