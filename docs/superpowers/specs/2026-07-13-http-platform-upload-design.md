# HTTP, Platform, and Upload Design

## Goal

Add a production-oriented, type-safe Axios foundation for JSON APIs and image uploads, while preserving the established Flutter WebView upload protocol and separating runtime detection from React state.

## Runtime Model

The application recognizes three host classifications: `browser`, `dapp`, and `flutter`.

- Flutter is identified only by the agreed marker `window.__FROM_FLUTTER__ === true`.
- Flutter bridge readiness additionally requires `window.Flutter.postMessage`.
- A DApp environment exposes an EIP-1193-like `window.ethereum.request` function.
- Flutter has host-classification priority even if an Ethereum provider is also injected.
- Runtime checks remain functions rather than Zustand state because platform capabilities are external environment facts, not mutable UI state.

## HTTP Architecture

The HTTP module contains one Axios instance. Request interceptors attach the Bearer token and explicitly distinguish JSON requests from `FormData`. Response error interceptors normalize Axios errors into a typed `HttpError`; HTTP 401 removes the cached token.

Feature modules will call a generic `request<TResponse, TBody>()` function with semantic business functions. The foundation does not create speculative auth or user APIs.

## Upload Architecture

Browser image upload selects an image through a temporary file input, creates `FormData`, and uploads it through the shared HTTP client with a 60-second timeout.

Flutter image upload preserves the existing protocol:

```text
Flutter.postMessage(JSON.stringify({ type: "uploadImage", token }))
receiveMessageFromFlutter("uploadImageUrl:<url>")
```

The established native bridge accepts a JSON string, matching the existing
XSmartPay implementation. It must not be changed to an object payload without
coordinating a Flutter protocol migration.

The Flutter adapter restores the previous callback after success, failure, or timeout. Because the existing protocol has no request identifier, concurrent Flutter uploads are rejected.

## File Structure

```text
src/services/
├── http/
│   ├── client.ts
│   ├── config.ts
│   ├── error.ts
│   ├── request.ts
│   └── index.ts
├── platform/
│   ├── runtime.ts
│   ├── flutterBridge.ts
│   └── index.ts
├── storage/
│   └── token.ts
└── upload/
    ├── browser.ts
    ├── flutter.ts
    ├── upload.ts
    ├── types.ts
    └── index.ts

src/types/runtime.d.ts
```

## Deferred Integrations

Code comments mark concrete future integration points:

- Wallet address request header.
- Current-language request header.
- Global authentication state synchronization after HTTP 401.
- Login-page navigation after HTTP 401.
- Global error messages.
- Global upload loading and progress UI.
- Request identifiers for concurrent Flutter uploads.
- Asynchronous wallet-provider discovery for delayed and multi-wallet injection.

## Constraints

- Install Axios as the only new dependency.
- Do not install routing, state management, internationalization, Web3, UI, or testing libraries.
- Normal POST, PUT, PATCH, and DELETE requests use JSON bodies.
- File uploads use `multipart/form-data` through `FormData`.
- Do not introduce React component dependencies into service modules.

## Verification

- Oxlint succeeds.
- TypeScript and Vite production build succeed.
- Runtime classification is exercised in the browser.
- Browser file selection cancellation cleans up without leaving a pending Promise.
- The starter React page remains functional without console errors.
