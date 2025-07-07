# Lessons Learned

This document serves as a reference for successful debugging efforts and solutions to technical challenges encountered during development.

---

## 1. Backend Fails to Start Due to Missing Build

-   **Issue:** The backend server failed to start with a `MODULE_NOT_FOUND` error, specifically `Cannot find module '/path/to/backend/dist/index.js'`.
-   **Root Cause:** The TypeScript source code in `src/` had not been compiled into JavaScript in the `dist/` directory. The `start` script (`node dist/index.js`) was trying to run code that didn't exist yet.
-   **Solution:** Before running `npm start`, the project must be built using the `npm run build` command, which invokes the TypeScript compiler (`tsc`).

---

## 2. Plaid SDK Crashing on Web

-   **Issue:** The application crashed on the web with a `TypeError: Cannot read properties of undefined (reading 'get')` originating from the `react-native-plaid-link-sdk`.
-   **Root Cause:** The `react-native-plaid-link-sdk` is primarily designed for native iOS and Android and lacks full compatibility with the web environment, causing its native module dependencies to fail in the browser.
-   **Solution:** We replaced the native SDK with `react-plaid-link` for the web platform. By using a conditional check (`Platform.OS === 'web'`), we can render the web-optimized component (`usePlaidLink` hook) in the browser while preserving the native SDK for iOS and Android builds.

---

## 3. Metro Bundler Fails on Test Files

-   **Issue:** After creating a unit test file (`.test.tsx`), the Metro development server returned a 500 Internal Server Error and was unable to bundle the application. The error log showed `Unable to resolve module`.
-   **Root Cause:** By default, the Metro bundler attempts to include all `.ts` and `.tsx` files it finds in the project. It was trying to bundle the test files as if they were part of the application source code, which they are not.
-   **Solution:** A `metro.config.js` file was created at the project root. We configured the `resolver.blacklistREs` property to include a regular expression (`/.*\.test\.tsx?$/`) that tells Metro to ignore any files ending in `.test.tsx` or `.test.ts`, preventing them from being included in the app bundle. 