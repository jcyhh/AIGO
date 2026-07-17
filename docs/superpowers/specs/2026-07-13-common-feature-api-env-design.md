# Common Feature APIs and Environment Template Design

## Goal

Add two reusable feature-level API examples and a safe three-file Vite environment convention suitable for copying into future H5/DApp projects.

## Feature Structure

```text
src/features/user/
├── api.ts
├── types.ts
└── README.md

src/features/banner/
├── api.ts
├── types.ts
└── README.md
```

- `getCurrentUser()` sends `GET /api/users/my`.
- `getBanners()` sends `GET /api/banners`.
- Functions return the existing generic `request<TResponse>()` Promise directly without redundant `async`/`await`.
- Types contain only fields observed in XSmartPay; TODO comments mark backend-contract completion.
- Each README explains responsibilities, naming, usage, extension, and future TanStack Query integration so the directory can serve as a template.

## Environment Convention

```text
.env.development  # ignored, local development values
.env.production   # ignored, production values
.env.example      # tracked template
```

All three contain the same keys:

```dotenv
VITE_BASE_URL=
VITE_RPC_URL=
VITE_USDT=
```

An empty production `VITE_BASE_URL` intentionally makes Axios resolve `/api/...` against the current origin. `.env.example` is documentation only and is not loaded automatically by Vite.

## Constraints

- Add no dependencies.
- Do not copy old project secrets, hosts, RPC URLs, or contract addresses.
- Ignore only `.env.development` and `.env.production`; keep `.env.example` trackable.
- Add strict `ImportMetaEnv` declarations in `src/vite-env.d.ts`.

## Verification

- Feature tests verify method, URL, and returned response data.
- All three env files contain the same key set.
- `.gitignore` ignores real environment files but not `.env.example`.
- All automated tests, Oxlint, TypeScript, and the Vite production build succeed.
