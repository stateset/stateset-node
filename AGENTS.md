# Repository Guidelines

## Project Structure & Module Organization
`src/` hosts the TypeScript source, grouped by concern: `lib/` for integrations and resource primitives, `utils/` for shared helpers, and `types/` for exported interfaces. Public test suites live in `__tests__/`, mirroring source filenames. Bundled artifacts emit into `dist/` after compilation, while `samples/` contains runnable usage examples; avoid editing `dist/` directly.

## Build, Test, and Development Commands
Use `npm run build` to clean and transpile the SDK into `dist/`. `npm run dev` and `npm run build:watch` keep TypeScript compilation running while you iterate. Run `npm test` for the default Jest suite, and `npm run test:coverage` or `npm run test:ci` when you need coverage data. `npm run validate` aggregates lint, type-check, and format checks; `npm run prepublishOnly` is enforced prior to release and should stay green.

## Coding Style & Naming Conventions
We target Node.js ≥ 18 and modern TypeScript. Follow the existing two-space indentation, trailing commas, and single quotes enforced by Prettier (`npm run format`). ESLint rules (`.eslintrc.*`) guard against unsafe patterns; fix-on-save via `npm run lint`. Prefer PascalCase for classes, camelCase for variables/functions, and maintain directory-level index files for public exports.

## Testing Guidelines
Jest with `ts-jest` powers the test suite. Co-locate specs under `__tests__/` using the `*.test.ts` suffix, mirroring the source path (`__tests__/utils/logger.test.ts` aligns with `src/utils/logger.ts`). Ensure coverage stays meaningful—new modules should include success and failure-path assertions. When introducing async behaviors or API calls, stub external requests with Jest mocks to keep tests deterministic.

## Advanced Request Controls
`StatesetClient.request` accepts rich options: toggle caching (`cache: false`), set custom cache keys or invalidation paths, attach `AbortSignal` instances, and override retry strategies with fine-grained backoff settings or per-attempt callbacks. Prefer `client.setRetryStrategy` for global defaults, and keep idempotency keys unique when issuing mutating calls.

## Commit & Pull Request Guidelines
Adopt conventional commit prefixes (`feat:`, `fix:`, `chore:`) as seen in recent history (e.g., `fix: resolve ESLint errors and warnings blocking npm publish`). Each pull request should summarize scope, list user-facing impacts, and link to tracking issues. Include testing evidence (`npm run test`, coverage diffs) and screenshots or sample payloads when touching integrations. Rebase on the latest `main` before requesting review to keep diffs focused.
