# Common Feature API and Env Implementation Plan

> **Goal:** Add two reusable feature API examples and a safe three-file Vite env template.

## Task 1: Specify feature API behavior with tests

- Add `tests/feature-api.test.mjs`.
- Verify `getCurrentUser()` sends `GET /api/users/my` and returns response data.
- Verify `getBanners()` sends `GET /api/banners` and returns response data.
- Run the focused test and confirm it fails because the feature modules do not exist yet.

## Task 2: Implement reusable feature modules

- Add `src/features/user/api.ts`, `types.ts`, and `README.md`.
- Add `src/features/banner/api.ts`, `types.ts`, and `README.md`.
- Keep API functions thin and return the typed shared `request()` promise directly.
- Document copying, extension, naming, and future TanStack Query placement.
- Run the focused test and confirm it passes.

## Task 3: Add the environment convention

- Add `.env.development`, `.env.production`, and `.env.example` with identical blank keys.
- Ignore the two real environment files while leaving `.env.example` trackable.
- Add strict Vite environment declarations in `src/vite-env.d.ts`.
- Verify the key sets and ignore rules.

## Task 4: Verify and review

- Run all tests.
- Run Oxlint.
- Run the TypeScript and Vite production build.
- Request an independent read-only code review and address valid findings.
- Repeat verification before reporting completion.
