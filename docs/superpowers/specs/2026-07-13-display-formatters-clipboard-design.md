# Display Formatters and Clipboard Design

## Goal

Replace the old Vue `v-init` and `v-copy` directives with explicit, typed React utilities and one lightweight amount display component. Do not migrate `onshow` or `scale`.

## Public API

```text
src/shared/formatters/
├── formatAmount.ts
├── formatQuantity.ts
├── maskWalletAddress.ts
├── maskPhoneNumber.ts
├── maskEmailAddress.ts
├── formatRelativeTime.ts
└── README.md

src/shared/clipboard/
├── copyTextToClipboard.ts
└── README.md

src/shared/components/AmountText/
├── AmountText.tsx
└── README.md
```

- `formatAmount(value)` formats DApp balances and prices. Empty, invalid, and zero values display as `0.00`.
- `formatQuantity(value)` formats inventory, counts, and other non-money values. Empty, invalid, and zero values display as `0`.
- Both numeric formatters accept `string | number | bigint | null | undefined`, add thousands separators, keep at most six decimal places, truncate instead of round, strip redundant trailing fractional zeroes, support negatives, and avoid converting string/bigint inputs to JavaScript `number`.
- `maskWalletAddress(value)` preserves the old first-five/last-four display rule and falls back to `--`.
- `maskPhoneNumber(value)` preserves the old first-three/last-four display rule and falls back to `--`.
- `maskEmailAddress(value)` is email-specific and preserves the domain while masking the local part.
- `formatRelativeTime(value, now?)` preserves the old today/yesterday/current-year/cross-year display behavior. The injectable `now` parameter makes it deterministic in tests.
- `copyTextToClipboard(text)` prefers `navigator.clipboard.writeText`, falls back to a temporary textarea plus `document.execCommand('copy')`, and resolves to a boolean. A TODO marks future Toast integration at the call site.
- `<AmountText value={...} />` renders `formatAmount(value)` and passes normal span attributes through.

## Naming Rule

Use action plus explicit object names. Avoid ambiguous names such as `init`, `filter`, `utils`, or `copy`. Files and their primary exports have matching names. Do not add redundant `shared` prefixes because the import path already expresses ownership.

## Verification

- Unit tests cover numeric precision, truncation, separators, zero conventions, invalid values, masks, relative time branches, and both clipboard paths.
- A component render test verifies `AmountText` without adding a testing dependency.
- Oxlint, TypeScript, all tests, and Vite production build must pass.
