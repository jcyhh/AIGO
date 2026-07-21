import test from 'node:test'
import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const SOURCE_ROOT = path.resolve('src')
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx'])
const EXCLUDED_PATH_PARTS = [
    `${path.sep}src${path.sep}i18n${path.sep}locales${path.sep}`,
    `${path.sep}src${path.sep}showcase${path.sep}`,
    `${path.sep}src${path.sep}vendor${path.sep}`,
    `${path.sep}src${path.sep}third-party${path.sep}`,
]
const EXCLUDED_FILES = new Set([
    path.resolve('src/i18n/config.ts'),
])
const STRING_LITERAL_PATTERN = /(['"`])(?:\\.|(?!\1).)*\1/g
const HAN_TEXT_PATTERN = /\p{Script=Han}/u
const DIRECT_I18N_KEY_PATTERN = /\b(?:t|translate)\('([^']+)'\)/g
const REQUIRED_INDIRECT_I18N_KEYS = [
    'nav.home',
    'nav.swap',
    'nav.weight',
    'nav.saving',
    'nav.eco',
    'nav.gamefi',
    'nav.airdrop',
    'nav.mall',
    'nav.pool',
    'weight.asset.xo',
    'weight.asset.weight',
    'weight.claim.insufficientXo',
    'weight.claim.insufficientWeight',
    'http.requestFailed',
    'http.unknown',
    'auth.tokenUnavailable',
    'auth.dappUnavailable',
    'auth.dappSessionChanged',
    'dapp.providerUnavailable',
    'dapp.walletAddressUnavailable',
    'dapp.gasBalanceInsufficient',
    'dapp.contractReverted',
    'dapp.tokenAddressUnavailable',
    'dapp.eip7702Unavailable',
    'dapp.erc20BalanceInsufficient',
    'dapp.invalidAmount',
    'contracts.aigoProjectAddressUnavailable',
    'contracts.laxProjectAddressUnavailable',
    'contracts.aigoTokenAddressUnavailable',
    'contracts.usdtAddressUnavailable',
    'contracts.aigoRouterAddressUnavailable',
]
const ENABLED_LANGUAGE_CODES = ['en', 'ja', 'ko', 'ru', 'zh-Hant', 'zh-Hans']

async function listSourceFiles(directory) {
    const entries = await readdir(directory, { withFileTypes: true })
    const files = await Promise.all(entries.map(async (entry) => {
        const entryPath = path.join(directory, entry.name)
        if (entry.isDirectory()) return listSourceFiles(entryPath)
        if (!SOURCE_EXTENSIONS.has(path.extname(entry.name))) return []
        return [entryPath]
    }))

    return files.flat()
}

function isExcludedFile(file) {
    if (EXCLUDED_FILES.has(file)) return true
    return EXCLUDED_PATH_PARTS.some((part) => file.includes(part))
}

function isTranslatedCall(line, literalStart) {
    const prefix = line.slice(0, literalStart).trimEnd()
    return /(?:^|[\s({,])(?:t|translate)\($/.test(prefix)
}

function findUnlocalizedLiterals(source) {
    const failures = []
    const lines = source.split('\n')

    lines.forEach((line, index) => {
        const literals = line.matchAll(STRING_LITERAL_PATTERN)
        for (const literal of literals) {
            const text = literal[0]
            if (!HAN_TEXT_PATTERN.test(text)) continue
            if (isTranslatedCall(line, literal.index ?? 0)) continue
            failures.push(`${index + 1}: ${line.trim()}`)
        }
    })

    return failures
}

test('production source user-facing Chinese copy goes through i18n', async () => {
    const files = (await listSourceFiles(SOURCE_ROOT)).filter((file) => !isExcludedFile(file))
    const failures = []

    await Promise.all(files.map(async (file) => {
        const source = await readFile(file, 'utf8')
        const fileFailures = findUnlocalizedLiterals(source)
        if (fileFailures.length === 0) return

        failures.push(`${path.relative(process.cwd(), file)}\n${fileFailures.join('\n')}`)
    }))

    assert.deepEqual(failures.sort(), [])
})

test('enabled languages load project-specific translation resources', async () => {
    const config = await readFile('src/i18n/config.ts', 'utf8')

    for (const code of ENABLED_LANGUAGE_CODES) {
        assert.match(config, new RegExp(`import\\('\\./locales/project/${code}\\.json'\\)`))
    }
})

test('enabled project languages provide every production translation key', async () => {
    const files = (await listSourceFiles(SOURCE_ROOT)).filter((file) => !isExcludedFile(file))
    const keys = new Set(REQUIRED_INDIRECT_I18N_KEYS)

    await Promise.all(files.map(async (file) => {
        const source = await readFile(file, 'utf8')
        for (const match of source.matchAll(DIRECT_I18N_KEY_PATTERN)) {
            keys.add(match[1])
        }
    }))

    const missing = []

    for (const code of ENABLED_LANGUAGE_CODES) {
        const source = await readFile(`src/i18n/locales/project/${code}.json`, 'utf8')
        const messages = JSON.parse(source)

        for (const key of keys) {
            if (typeof messages[key] !== 'string' || !messages[key].trim()) {
                missing.push(`${code}: ${key}`)
            }
        }
    }

    assert.deepEqual(missing.sort(), [])
})
