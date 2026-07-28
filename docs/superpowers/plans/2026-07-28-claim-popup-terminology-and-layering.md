# Claim Popup Terminology and Layering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Use `领取` for home reward confirmations and ensure gradient-card popup content remains visible in mobile wallet WebViews.

**Architecture:** Keep withdrawal and reward terminology distinct at the project-glossary and page-call-site layers. Fix the popup only in the gradient-card presentation layer by isolating its stacking context, rendering the border pseudo-element at level 0, and rendering direct content children at level 1.

**Tech Stack:** React 19, TypeScript, SCSS, react-i18next, Node test runner, Vite.

## Global Constraints

- Use `提取` only for Token withdrawal/redeem actions that would otherwise be called `提现`.
- Use `领取` for order, static, and dynamic reward claims.
- Do not use JSX `style` attributes.
- Use SCSS for page and component styles.
- Run `pnpm lint`, `pnpm test`, and `pnpm build` before completion; report unrelated existing failures without modifying unrelated files.

---

### Task 1: Protect the gradient-card popup content from its border overlay

**Files:**
- Modify: `tests/confirm-popup.test.mjs`
- Modify: `src/components/Popup/PopupContent/PopupContent.scss:19-30`

**Interfaces:**
- Consumes: the `gradient-card` mixin, whose `::before` pseudo-element draws the card border.
- Produces: a `popup-content--gradient-card` stacking context where the border is below the header and body content.

- [ ] **Step 1: Write the failing test**

Add assertions that `PopupContent.scss` contains the following gradient-card rules:

```js
assert.match(popupContentStyles, /&--gradient-card\s*\{[\s\S]*isolation:\s*isolate;/)
assert.match(popupContentStyles, /&--gradient-card[\s\S]*&::before\s*\{[\s\S]*z-index:\s*0;/)
assert.match(popupContentStyles, /&--gradient-card[\s\S]*> \*\s*\{[\s\S]*position:\s*relative;[\s\S]*z-index:\s*1;/)
```

Load `src/components/Popup/PopupContent/PopupContent.scss` in the test fixture list as `popupContentStyles`.

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec node --test tests/confirm-popup.test.mjs`

Expected: FAIL because `popup-content--gradient-card` has no explicit stacking levels.

- [ ] **Step 3: Add the minimum stacking rules**

Within `&--gradient-card`, after the existing `@include gradient-card(...)`, add:

```scss
isolation: isolate;

&::before {
    z-index: 0;
}

> * {
    position: relative;
    z-index: 1;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec node --test tests/confirm-popup.test.mjs`

Expected: PASS.

- [ ] **Step 5: Commit the focused fix**

```bash
git add src/components/Popup/PopupContent/PopupContent.scss tests/confirm-popup.test.mjs
git commit -m "fix: keep popup content above gradient border"
```

### Task 2: Restore reward-claim wording without changing Token withdrawal wording

**Files:**
- Modify: `AGENTS.md:193-197`
- Modify: `src/pages/main/home/HomePage.tsx:408-429`
- Modify: `src/i18n/locales/project/en.json`
- Modify: `src/i18n/locales/project/ja.json`
- Modify: `src/i18n/locales/project/ko.json`
- Modify: `src/i18n/locales/project/ru.json`
- Modify: `src/i18n/locales/project/zh-Hans.json`
- Modify: `src/i18n/locales/project/zh-Hant.json`
- Modify: `tests/home-page.test.mjs`
- Modify: `tests/terminology.test.mjs`

**Interfaces:**
- Consumes: `t(key)` translation lookups from `HomePage` and the enabled project locale files.
- Produces: a `确认要领取吗？` key in every enabled locale; every home reward confirmation uses that key; saving-page withdrawal remains `提取`.

- [ ] **Step 1: Write failing terminology tests**

In `tests/home-page.test.mjs`, add assertions that `HomePage.tsx` contains three occurrences of `message={t('确认要领取吗？')}` and no `确认要提取吗？` key.

In `tests/terminology.test.mjs`, load `AGENTS.md` and assert:

```js
assert.match(agentRules, /withdrawal\/redeem actions, use `提取`/)
assert.match(agentRules, /订单、静态与动态收益领取使用 `领取`/)
```

- [ ] **Step 2: Run the focused tests to verify they fail**

Run: `pnpm exec node --test tests/home-page.test.mjs tests/terminology.test.mjs`

Expected: FAIL because the home page still uses `确认要提取吗？` and the glossary still categorizes reward claims as `提取`.

- [ ] **Step 3: Make the minimum copy changes**

1. Replace all three home popup calls with `message={t('确认要领取吗？')}`.
2. Replace the old project-locale key `确认要提取吗？` with `确认要领取吗？` and translate it as:

```text
en: Confirm claim?
ja: 受取を確認しますか？
ko: 수령하시겠습니까?
ru: Подтвердить получение?
zh-Hans: 确认要领取吗？
zh-Hant: 確認要領取嗎？
```

3. Change the Chinese glossary rule to distinguish Token withdrawal/redeem (`提取`) from order, static, and dynamic reward claims (`领取`), while retaining the prohibition on `提现` for withdrawal UI copy.
4. Do not alter the saving-page `提取` labels or unrelated existing `提取` copy.

- [ ] **Step 4: Run focused tests to verify they pass**

Run: `pnpm exec node --test tests/home-page.test.mjs tests/terminology.test.mjs tests/project-i18n.test.mjs`

Expected: PASS, including all enabled locale-key consistency checks.

- [ ] **Step 5: Commit the terminology change**

```bash
git add AGENTS.md src/pages/main/home/HomePage.tsx src/i18n/locales/project tests/home-page.test.mjs tests/terminology.test.mjs
git commit -m "fix: distinguish reward claims from withdrawals"
```

### Task 3: Verify the release artefact

**Files:**
- No source changes.

**Interfaces:**
- Consumes: the completed popup styling and translation changes.
- Produces: verification evidence for the corrected production artefact.

- [ ] **Step 1: Run static validation**

Run: `pnpm lint`

Expected: PASS with no new warnings or errors.

- [ ] **Step 2: Run the full test suite**

Run: `pnpm test`

Expected: PASS; if the known `.env.development` comment check fails, report it as an existing unrelated failure.

- [ ] **Step 3: Run the production build**

Run: `pnpm build`

Expected: PASS unless blocked by the same pre-existing test failure.

- [ ] **Step 4: Manually verify the mobile modal after deployment**

Open `https://www.cxaigo.net/h5/home` in TokenPocket, open a static or dynamic reward confirmation, and confirm that the title, `确认要领取吗？` message, and confirmation button render above the gradient border.

## Self-Review

- Spec coverage: Task 1 fixes the confirmed WebView overlay; Task 2 updates the agreed terminology boundary; Task 3 verifies static and mobile-wallet behavior.
- Placeholder scan: no unfilled markers or undefined interfaces remain.
- Type consistency: no TypeScript interface changes are required; all affected component interfaces remain unchanged.
