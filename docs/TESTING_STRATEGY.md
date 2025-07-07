# Comprehensive Testing Strategy for EmpowerFlow MVP

This document outlines the unit and end-to-end (E2E) testing strategy for the EmpowerFlow MVP, based on the features defined in the `PRODUCT_DOCUMENTATION.md`.

## Testing Tools & Frameworks

-   **Unit & Integration Testing:** Jest, React Testing Library (for React Native components).
-   **E2E Testing:** Detox or a similar framework for automated E2E tests on simulators/devices.
-   **Mocking:** We will mock the Plaid API and our own backend API for most tests to ensure they are fast and reliable.

---

## Layer 1: Data Integration & Enhanced Categorization

### Unit Tests

-   **[x] Bank Linking Component:**
    -   `[x]` Renders the "Connect a Bank Account" button.
    -   `[x]` Displays a loading state while the `link_token` is being fetched.
    -   `[x]` The PlaidLink component is rendered when a `link_token` is available.
-   **[x] API Service (Frontend):**
    -   `[x]` Mocks the backend call to generate a `link_token` and asserts that the service correctly returns the token.
    -   `[x]` Mocks the backend call to exchange a `public_token` for an `access_token` and asserts that the `onSuccess` callback is handled correctly.
-   **[x] Backend `link_token` Endpoint:**
    -   `[x]` Asserts that the endpoint successfully communicates with the Plaid API and returns a valid `link_token`.
    -   `[x]` Asserts that the endpoint handles Plaid API errors gracefully.
-   **[x] Backend `exchange_token` Endpoint:**
    -   `[x]` Asserts that the endpoint successfully exchanges a `public_token` for an `access_token` and stores it.
    -   `[x]` Asserts that the endpoint handles errors from the Plaid API during the exchange.

### End-to-End (E2E) Tests

-   **[x] Full Bank Linking Flow:**
    -   `[x]` User taps "Connect Bank Account."
    -   `[x]` The Plaid Link modal opens (this part will be mocked, we'll simulate the `onSuccess` callback).
    -   `[x]` After the simulated `onSuccess`, the user is navigated to the main dashboard or a success screen, confirming the account is linked.
-   **[x] Handling Link Exit:**
    -   `[x]` User opens the Plaid Link modal and then closes it.
    -   `[x]` The app correctly handles the `onExit` callback and remains on the bank linking screen.

---

## Layer 2: Foundational AI Coaching & Transaction Management

### Unit Tests

-   **[ ] Transaction List Component (Frontend):**
    -   `[ ]` Renders a list of transaction items when given data.
    -   `[ ]` Displays a user-friendly message or empty state when there are no transactions.
    -   `[ ]` Each transaction item correctly displays the merchant, amount, date, and category.
-   **[ ] Anomaly Detection Service (Backend):**
    -   `[ ]` Given a list of transactions, correctly calculates the 4-week average spending for a specific category.
    -   `[ ]` Correctly identifies a spending anomaly when the current week's spending exceeds the average by a defined threshold.
    -   `[ ]` Returns a null or empty response when there is not enough historical data to perform a calculation.
-   **[ ] Recurring Bill Service (Backend):**
    -   `[ ]` Correctly identifies transactions that are likely recurring based on name, amount, and interval.
    -   `[ ]` Groups similar recurring transactions (e.g., "Netflix," "NETFLIX.COM") into a single biller.

### End-to-End (E2E) Tests

-   **[ ] Viewing Transactions:**
    -   `[ ]` User logs in, lands on the dashboard, and sees a list of their recent transactions loaded from the backend.
-   **[ ] Viewing a Spending Alert:**
    -   `[ ]` A test scenario is created where a user's spending in a category is artificially inflated.
    -   `[ ]` When the user visits the dashboard, they see a clear, understandable alert about their spending anomaly.

---

## Layer 3: Robust Scenario Planning & Forecasting

### Unit Tests

-   **[ ] "What If" Scenario Calculator:**
    -   `[ ]` Given a loan amount, interest rate, and term, the calculator correctly computes the monthly payment.
    -   `[ ]` Given a new income amount, the calculator correctly shows the increase in free cash flow.
-   **[ ] Cash Flow Visualization Component:**
    -   `[ ]` Renders a line graph correctly based on provided income and expense data.

### End-to-End (E2E) Tests

-   **[ ] Creating a "New Debt" Scenario:**
    -   `[ ]` User navigates to the scenario planning feature.
    -   `[ ]` User inputs the details of a new car loan.
    -   `[ ]` The app displays the correct monthly payment and its impact on their monthly budget.

---

## Layer 4: Enhanced Integration with Financial Goals

### Unit Tests

-   **[ ] Goal Creation Form:**
    -   `[ ]` The form correctly captures the goal name, target amount, and target date.
    -   `[ ]` The form validates the input correctly (e.g., target amount must be a positive number).
-   **[ ] Goal Progress Calculator:**
    -   `[ ]` Correctly calculates the percentage of a goal that has been completed.
    -   `[ ]` Links a reduction in discretionary spending to progress towards a goal.

### End-to-End (E2E) Tests

-   **[ ] Creating and Tracking a Goal:**
    -   `[ ]` User creates a new savings goal for a vacation.
    -   `[ ]` User manually contributes money to the goal.
    -   `[ ]` The goal's progress bar updates to reflect the new contribution.

---

## Layer 5: "Scratch Pad" or Flexible Planning Space

### Unit Tests

-   **[ ] Notes Component:**
    -   `[ ]` Allows a user to create, edit, and delete a free-form text note.
-   **[ ] Temporary Budget Adjustment Logic:**
    -   `[ ]` A user can temporarily reduce their "Dining Out" budget for two weeks.
    -   `[ ]` The main budget reflects this change for the specified period and then reverts.

### End-to-End (E2E) Tests

-   **[ ] Using the Scratch Pad:**
    -   `[ ]` User navigates to the scratch pad and jots down a quick note about an upcoming expense.
    -   `[ ]` The note is saved and is visible when they return to the screen.

---

## Layer 6: More Advanced Debt Management Strategies

### Unit Tests

-   **[ ] Debt Payoff Calculator:**
    -   `[ ]` Given a loan balance, interest rate, and an extra payment amount, the calculator correctly estimates the new payoff date and total interest saved.
-   **[ ] Debt Strategy Modeler (Avalanche/Snowball):**
    -   `[ ]` Given a list of debts, the modeler correctly prioritizes them based on the selected strategy (lowest balance vs. highest interest rate).

### End-to-End (E2E) Tests

-   **[ ] Comparing Debt Payoff Strategies:**
    -   `[ ]` User navigates to the debt management tool.
    -   `[ ]` User selects the "Debt Avalanche" strategy.
    -   `[ ]` The app displays a clear visualization of how this strategy will accelerate their debt payoff compared to making minimum payments. 