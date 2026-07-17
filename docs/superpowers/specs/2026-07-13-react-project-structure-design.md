# React Project Structure Design

## Goal

Organize the minimal React project for future mobile DApp development without adding application dependencies or prematurely implementing business features.

## Directory Structure

```text
src/
├── app/              # Application composition and future global providers
├── pages/            # Route-level page components
├── features/         # Self-contained business modules
├── components/       # Reusable application-wide UI components
├── hooks/            # Reusable application-wide React hooks
├── services/         # External boundaries such as HTTP, storage, and wallet services
├── stores/           # Future global client-state stores
├── utils/            # Pure utility functions
├── types/            # Shared TypeScript types
├── assets/           # Static images and fonts imported by source code
└── styles/           # Global styles, variables, and mixins
```

## Initial Code Movement

- Move the root `App` component and its component stylesheet from `src/` to `src/app/`.
- Update `src/main.tsx` to import `App` from `src/app/App.tsx`.
- Keep `src/index.css` at the source root because it is imported by the application entry point and currently provides global styles.
- Keep existing demo assets in `src/assets/`.

## Empty Directory Policy

Add a short `README.md` to directories that have no implementation yet. Each README states the directory's responsibility. Do not add placeholder TypeScript modules or barrel exports before they have real consumers.

## Constraints

- Do not install dependencies.
- Do not add routing, networking, state management, Web3, internationalization, Sass, PostCSS, testing, or UI libraries.
- Do not create speculative `auth`, `wallet`, `contract`, or `transaction` feature modules yet.
- Keep the official starter page and counter behavior working.

## Verification

- Oxlint succeeds.
- TypeScript and the Vite production build succeed.
- The starter page renders in the browser without console errors.
