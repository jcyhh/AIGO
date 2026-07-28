# Home Order Card Responsive Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every home-page order card accommodate long values and localized copy without constraining them to competing fixed columns.

**Architecture:** Keep `HomeOrderCard` as the presentation boundary and preserve its existing `HomeOrder` and `onClaim` interfaces. Restructure only its markup into vertical amount, progress, and optional claim sections, then use page-scoped SCSS for the full-width progress presentation.

**Tech Stack:** React 19, TypeScript, SCSS, Node test runner.

## Global Constraints

- Do not change order data, progress calculation, status behavior, or the claim callback.
- Keep active and completed orders on the same responsive top layout.
- Do not truncate amounts, dates, progress values, or translated copy.
- Use page-scoped SCSS and existing global utility classes.

---

### Task 1: Restructure and style the shared order card

**Files:**
- Modify: `src/pages/main/home/components/HomeOrderCard.tsx`
- Modify: `src/pages/main/home/HomePage.scss`
- Modify: `tests/home-page.test.mjs`

**Interfaces:**
- Consumes: `HomeOrderCardProps` with `order: HomeOrder` and `onClaim(order: HomeOrder): void`.
- Produces: The existing card rendering and claim click behavior with a responsive vertical information layout.

- [ ] **Step 1: Write the failing test**

Add assertions that `HomeOrderCard.tsx` renders a top metadata row, a separate amount row, a separate progress copy row before `ProgressBar`, and keeps the optional active-order claim section after the divider. Add assertions that `HomePage.scss` makes the progress section full width and removes the fixed `width: 200px` progress column.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec node --test tests/home-page.test.mjs`

Expected: FAIL because the card still renders the summary and progress as two fixed columns.

- [ ] **Step 3: Write minimal implementation**

Update the card structure to this order:

```tsx
<div className="home-page__order-meta flex-between items-center">
  <span>{t('协作额度')}</span>
  <span>{order.dateText}</span>
</div>
<div className="home-page__order-amount">...</div>
<div className="home-page__order-progress-copy">...</div>
<ProgressBar className="home-page__order-progress-bar" ... />
```

Keep the existing active-order divider, claimable loading state, button classes, and `onClaim(order)` callback unchanged. Use SCSS so the progress area has `width: 100%` and no fixed column width.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec node --test tests/home-page.test.mjs`

Expected: PASS.

- [ ] **Step 5: Run project verification and commit**

Run: `pnpm test && pnpm lint && pnpm build`

Expected: all tests, lint, TypeScript, and production build pass.

Commit:

```bash
git add src/pages/main/home/components/HomeOrderCard.tsx src/pages/main/home/HomePage.scss tests/home-page.test.mjs
git commit -m "fix: make home order cards responsive"
```
