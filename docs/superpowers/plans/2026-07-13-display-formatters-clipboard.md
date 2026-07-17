# Display Formatters and Clipboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the old Vue display and copy directives with precise React-friendly utilities and an amount component.

**Architecture:** Pure functions own formatting and masking; a small React component delegates to the amount formatter; clipboard behavior is isolated behind an asynchronous boolean-returning utility. Numeric formatting shares a private string parser and never converts string/bigint values to JavaScript number.

**Tech Stack:** React 19, TypeScript 6, Node test runner, Oxlint, Vite.

## Global Constraints

- Add no runtime dependency.
- Do not migrate `onshow` or `scale`.
- Files and primary exports use matching, explicit action-plus-object names.
- Preserve old display behavior unless the specification defines a safer result.

---

### Task 1: Numeric display formatters

**Files:**
- Create: `tests/numeric-formatters.test.mjs`
- Create: `src/shared/formatters/numericString.ts`
- Create: `src/shared/formatters/formatAmount.ts`
- Create: `src/shared/formatters/formatQuantity.ts`

**Interfaces:**
- Produces: `formatAmount(value: NumericDisplayValue): string`
- Produces: `formatQuantity(value: NumericDisplayValue): string`

- [ ] Write tests for zero conventions, separators, six-place truncation, negatives, huge string values, bigint, and invalid inputs.
- [ ] Run `node --test tests/numeric-formatters.test.mjs`; expect missing-module failure.
- [ ] Implement a shared normalized string formatter plus the two semantic public functions.
- [ ] Run the focused test; expect all cases to pass.

### Task 2: Mask and time formatters

**Files:**
- Create: `tests/text-formatters.test.mjs`
- Create: `src/shared/formatters/maskWalletAddress.ts`
- Create: `src/shared/formatters/maskPhoneNumber.ts`
- Create: `src/shared/formatters/maskEmailAddress.ts`
- Create: `src/shared/formatters/formatRelativeTime.ts`
- Create: `src/shared/formatters/README.md`

**Interfaces:**
- Produces: `maskWalletAddress`, `maskPhoneNumber`, `maskEmailAddress`, and `formatRelativeTime`.

- [ ] Write tests for valid, empty, short, malformed, today, yesterday, current-year, and cross-year inputs.
- [ ] Run the focused test; expect missing-module failure.
- [ ] Implement the formatters and module documentation.
- [ ] Run the focused test; expect all cases to pass.

### Task 3: Clipboard utility

**Files:**
- Create: `tests/clipboard.test.mjs`
- Create: `src/shared/clipboard/copyTextToClipboard.ts`
- Create: `src/shared/clipboard/README.md`

**Interfaces:**
- Produces: `copyTextToClipboard(text: string): Promise<boolean>`.

- [ ] Write tests for native success/failure, fallback success, cleanup, and empty input.
- [ ] Run the focused test; expect missing-module failure.
- [ ] Implement native clipboard and textarea fallback behavior.
- [ ] Run the focused test; expect all cases to pass.

### Task 4: AmountText component and final verification

**Files:**
- Create: `tests/amount-text.test.mjs`
- Create: `src/shared/components/AmountText/AmountText.tsx`
- Create: `src/shared/components/AmountText/README.md`

**Interfaces:**
- Consumes: `formatAmount`.
- Produces: `AmountText(props)` with standard span attributes.

- [ ] Write a server-render test for formatted text and passed-through span attributes.
- [ ] Run the focused test; expect missing-module failure.
- [ ] Implement `AmountText` and its documentation.
- [ ] Run all tests, Oxlint, and the production build.
- [ ] Request independent code review, address valid findings, and repeat verification.
