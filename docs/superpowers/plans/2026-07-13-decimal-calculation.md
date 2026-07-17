# Decimal Business Calculation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add exact, dependency-free decimal business calculations with the project's empty and zero fallback rules.

**Architecture:** A private parser represents values as BigInt coefficients and decimal scales. Four explicit public functions apply validated business fallbacks before exact arithmetic and normalized string serialization.

**Tech Stack:** TypeScript 6, native BigInt, Node test runner, Oxlint, Vite.

## Global Constraints

- Add no dependency.
- Return strings without display separators.
- Preserve the approved non-standard empty/zero fallback rules.
- Default division precision is 18 fractional digits with truncation.

---

### Task 1: Decimal business arithmetic

**Files:**
- Create: `tests/decimal-numbers.test.mjs`
- Create: `src/shared/calculations/decimalNumbers.ts`
- Create: `src/shared/calculations/README.md`

**Interfaces:**
- Produces: `DecimalCalculationValue`, `addDecimalNumbers`, `subtractDecimalNumbers`, `multiplyDecimalNumbers`, and `divideDecimalNumbers`.

- [ ] Write failing tests for types, precision, all operations, fallback rules, invalid input, scientific notation, negatives, and division precision.
- [ ] Run `node --test tests/decimal-numbers.test.mjs`; expect missing-module failure.
- [ ] Implement parsing, normalization, exact arithmetic, and documentation.
- [ ] Run the focused test; expect all cases to pass.
- [ ] Run all tests, Oxlint, and production build.
- [ ] Request independent review, address valid findings, and repeat verification.
