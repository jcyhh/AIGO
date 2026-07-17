# HTTP, Platform, and Upload Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a typed Axios JSON request layer and browser/Flutter image-upload adapters with explicit runtime detection.

**Architecture:** Keep HTTP, platform, storage, and upload responsibilities independent. Business features consume a typed `request<TResponse, TBody>()` function or the high-level `uploadImage()` function without importing Axios or inspecting global Flutter objects.

**Tech Stack:** React 19, TypeScript 6, Vite 8, Oxlint, Axios, Node test runner

## Global Constraints

- Axios is the only new dependency.
- Normal mutation requests send JSON; uploads send `FormData`.
- Preserve `__FROM_FLUTTER__`, the JSON-string `Flutter.postMessage` payload, `receiveMessageFromFlutter`, and the `uploadImageUrl:` response prefix.
- Do not add React, routing, state, i18n, Web3, UI, or test-library dependencies to services.
- Mark only concrete future integration points with TODO comments.

---

### Task 1: Add dependency and contract tests

**Files:**
- Modify: `package.json`
- Create: `tests/runtime.test.mjs`
- Create: `tests/http-error.test.mjs`
- Create: `tests/token.test.mjs`

**Interfaces:**
- Produces: executable expectations for `getRuntimeHost`, `isFlutterHost`, `isFlutterBridgeReady`, `isDappEnvironment`, `toHttpError`, and token storage functions.

- [ ] Install Axios with `npm install axios`.
- [ ] Add `"test": "node --test tests/*.test.mjs"` to scripts.
- [ ] Write Node tests that exercise browser, DApp, Flutter, Axios-error normalization, and token storage behavior.
- [ ] Run `npm test` and verify RED because the service modules do not exist.

### Task 2: Implement platform and storage services

**Files:**
- Create: `src/types/runtime.d.ts`
- Create: `src/services/platform/runtime.ts`
- Create: `src/services/platform/flutterBridge.ts`
- Create: `src/services/platform/index.ts`
- Create: `src/services/storage/token.ts`

**Interfaces:**
- Produces: `RuntimeHost`, `isFlutterHost()`, `isFlutterBridgeReady()`, `isDappEnvironment()`, `getRuntimeHost()`, `postMessageToFlutter()`, `getToken()`, `setToken()`, and `removeToken()`.

- [ ] Implement capability functions with Flutter host priority.
- [ ] Implement a bridge sender that validates both the host marker and bridge readiness.
- [ ] Implement localStorage token access using the established `TOKEN` key.
- [ ] Run focused runtime and token tests and verify GREEN.

### Task 3: Implement typed HTTP service

**Files:**
- Create: `src/services/http/config.ts`
- Create: `src/services/http/error.ts`
- Create: `src/services/http/client.ts`
- Create: `src/services/http/request.ts`
- Create: `src/services/http/index.ts`

**Interfaces:**
- Produces: `HttpError`, `toHttpError()`, `httpClient`, and `request<TResponse, TBody>()`.

- [ ] Implement an error normalizer preserving status, response data, and cause.
- [ ] Create one Axios instance with base URL and a 10-second timeout.
- [ ] Attach a non-empty Bearer token and select JSON or FormData content handling.
- [ ] Remove the token on 401 and mark auth-state, navigation, language, wallet, and message integration points.
- [ ] Implement the generic request function that unwraps `AxiosResponse.data`.
- [ ] Run the HTTP error test and verify GREEN.

### Task 4: Implement browser and Flutter upload adapters

**Files:**
- Create: `src/services/upload/types.ts`
- Create: `src/services/upload/browser.ts`
- Create: `src/services/upload/flutter.ts`
- Create: `src/services/upload/upload.ts`
- Create: `src/services/upload/index.ts`

**Interfaces:**
- Produces: `UploadResult`, `selectImageFile()`, `uploadFile()`, `uploadImageWithFlutter()`, and `uploadImage()`.

- [ ] Implement temporary image input selection with change, cancel, and cleanup paths.
- [ ] Implement `FormData` upload using the shared request function and a 60-second timeout.
- [ ] Implement the existing Flutter protocol with timeout, callback restoration, duplicate-result protection, and concurrent-upload rejection.
- [ ] Route Flutter hosts to the bridge adapter and all other hosts, including DApp browsers, to browser upload.

### Task 5: Verify the complete foundation

**Files:**
- Verify all files created in Tasks 1-4.

**Interfaces:**
- Consumes all preceding contracts.
- Produces verified package scripts and production output.

- [ ] Run `npm test` and require all tests to pass.
- [ ] Run `npm run lint` and require zero errors.
- [ ] Run `npm run build` and require successful TypeScript and Vite output.
- [ ] Open the starter page, exercise runtime classification through browser evaluation, and confirm no console errors or warnings.
