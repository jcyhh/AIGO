# Viewport Pixel and Percentage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add one-shot viewport pixel conversion and exact integer percentage helpers.

**Architecture:** Viewport helpers read dimensions only when called and delegate arithmetic to the decimal calculation module before returning safe numbers. Percentage validation reuses exact decimal parsing/comparison rather than coercing DApp values to JavaScript number.

**Tech Stack:** TypeScript 6, React usage documentation, Node test runner, Oxlint, Vite.

## Global Constraints

- Add no dependency or event listener.
- Use explicit action-plus-object names.
- Return numbers because third-party components consume physical pixels and integer progress values.

---

### Task 1: One-shot viewport conversions

**Files:**
- Create: `tests/viewport-pixels.test.mjs`
- Create: `src/shared/viewport/getViewportWidthPx.ts`
- Create: `src/shared/viewport/getViewportHeightPx.ts`
- Create: `src/shared/viewport/README.md`

- [ ] Write failing tests for width, height, custom design sizes, SSR, validation, and dimension read count.
- [ ] Run the focused test and confirm the modules are missing.
- [ ] Implement both helpers and React lifecycle documentation.
- [ ] Run the focused test and confirm it passes.

### Task 2: Exact integer percentage

**Files:**
- Create: `tests/calculate-percentage.test.mjs`
- Create: `src/shared/calculations/calculatePercentage.ts`
- Modify: `src/shared/calculations/decimalNumbers.ts`
- Modify: `src/shared/calculations/README.md`

- [ ] Write failing tests for exact division, truncation, cap, and invalid boundaries.
- [ ] Run the focused test and confirm the module is missing.
- [ ] Expose a strict decimal comparison primitive and implement percentage through existing divide/multiply functions.
- [ ] Run focused and full verification.
- [ ] Request independent review, address valid findings, and repeat verification.
