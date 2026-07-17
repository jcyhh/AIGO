# Decimal Business Calculation Design

## Goal

Provide dependency-free, precision-safe decimal add, subtract, multiply, and divide functions for DApp business data received as strings, integers, floating-point numbers, bigint values, empty values, or zero.

## Public API

```text
src/shared/calculations/
├── decimalNumbers.ts
└── README.md
```

```ts
type DecimalCalculationValue = string | number | bigint | null | undefined

addDecimalNumbers(left, right): string
subtractDecimalNumbers(left, right): string
multiplyDecimalNumbers(left, right): string
divideDecimalNumbers(left, right, maximumFractionDigits?): string
```

All functions return normalized decimal strings without thousands separators. Division keeps at most 18 fractional digits by default and truncates rather than rounds.

For browser resource safety, input text is limited to 10,000 characters, scientific exponents and parsed scales are limited to an absolute value of 10,000, and requested division precision is limited to 100 digits. Out-of-range values return `"0"`.

## Business Fallback Rules

- `null`, `undefined`, and whitespace-only strings are empty values.
- If either non-empty input is invalid (`NaN`, `Infinity`, or a non-numeric string), return `"0"`.
- If both inputs are empty, return `"0"`.
- For addition and subtraction, an empty or zero side returns the normalized non-zero side unchanged.
- For multiplication and division, an empty side returns the normalized present side unchanged.
- For multiplication and division, either zero side returns `"0"`.
- These are project-specific fallback semantics, not standard arithmetic identities. The README must show the surprising subtraction and division cases explicitly.

## Precision Strategy

Parse decimal/scientific notation into a signed `BigInt` coefficient plus a decimal scale. Addition/subtraction align scales, multiplication adds scales, and division performs scaled integer division. Never convert string or bigint inputs to JavaScript `number`; number inputs can only retain the precision they already possess.

## Verification

Tests cover every input type, empty/zero fallback behavior, invalid inputs, negatives, huge decimals, scientific notation, four arithmetic operations, division by zero, truncation, and custom division precision. Oxlint, TypeScript, all tests, and Vite build must pass.
