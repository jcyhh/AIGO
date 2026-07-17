# React Project Structure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the approved hybrid React directory structure without changing starter behavior or adding dependencies.

**Architecture:** Keep `src/main.tsx` as the browser entry point and move root application composition into `src/app/`. Reserve focused top-level directories for route pages, business features, shared UI, hooks, external services, stores, utilities, shared types, source assets, and global styles.

**Tech Stack:** React 19, TypeScript 6, Vite 8, Oxlint, npm

## Global Constraints

- Do not install dependencies.
- Do not add routing, networking, state management, Web3, internationalization, Sass, PostCSS, testing, or UI libraries.
- Do not create speculative business modules.
- Keep the official starter page and counter behavior working.

---

### Task 1: Reorganize the source tree

**Files:**
- Create: `src/app/App.tsx`
- Create: `src/app/App.css`
- Modify: `src/main.tsx`
- Delete: `src/App.tsx`
- Delete: `src/App.css`
- Create: `src/pages/README.md`
- Create: `src/features/README.md`
- Create: `src/components/README.md`
- Create: `src/hooks/README.md`
- Create: `src/services/README.md`
- Create: `src/stores/README.md`
- Create: `src/utils/README.md`
- Create: `src/types/README.md`
- Create: `src/styles/README.md`

**Interfaces:**
- Consumes: `App` as the default root component and the existing assets under `src/assets/`.
- Produces: `src/app/App.tsx` exporting the default root component for `src/main.tsx`.

- [ ] **Step 1: Capture the current passing baseline**

Run: `npm run lint && npm run build`

Expected: both commands exit with code 0.

- [ ] **Step 2: Move the root application component**

Move `src/App.tsx` and `src/App.css` into `src/app/`. Update asset imports in `src/app/App.tsx` from `./assets/...` to `../assets/...`, while retaining `import './App.css'`.

- [ ] **Step 3: Update the browser entry point**

Change the default component import in `src/main.tsx` to:

```ts
import App from './app/App.tsx'
```

- [ ] **Step 4: Document empty directory responsibilities**

Create one concise `README.md` in each approved empty directory. Each file names the directory and states only its responsibility from the approved design.

- [ ] **Step 5: Verify static checks and production compilation**

Run: `npm run lint && npm run build`

Expected: both commands exit with code 0 and Vite emits `dist/` assets.

- [ ] **Step 6: Verify starter behavior in the browser**

Run: `npm run dev -- --host 127.0.0.1`

Open the local URL and verify the `Get started` heading and `Count is 0` button are present, clicking the button changes it to `Count is 1`, and no browser console errors or warnings are reported.
