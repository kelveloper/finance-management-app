# EmpowerFlow - Personal Finance Management App

EmpowerFlow is a modern, AI-driven personal finance application designed to provide users with a clear view of their financial health and proactive insights to improve their spending habits.

## Features

*   **Secure Bank Connection:** Uses Plaid to securely link to user bank accounts.
*   **Transaction Feed:** Displays a real-time list of all user transactions.
*   **AI-Powered Insights:** Proactively analyzes user spending to identify anomalies. When a user's spending in a category is significantly higher than their recent average, the app provides a helpful "Why Did I Spend That?" insight on the dashboard.

## Getting Started

### Prerequisites

*   Node.js and npm
*   An active Plaid account and API keys (https://dashboard.plaid.com/)

### Backend Setup

1.  Navigate to the `backend` directory:
    `cd backend`
2.  Install dependencies:
    `npm install`
3.  Create a `.env` file and populate it with your Plaid API keys:
    ```
    PLAID_CLIENT_ID=YOUR_CLIENT_ID
    PLAID_SECRET=YOUR_SECRET
    PLAID_ENV=sandbox # Use 'sandbox' for testing, 'development' for live data
    PORT=8000
    ```
4.  Start the backend server:
    `npm run dev`

### Frontend Setup

1.  In a new terminal, navigate to the root directory.
2.  Install dependencies:
    `npm install`
3.  Start the frontend application:
    `npm run start`

The application will now be running and accessible in your browser or on your mobile device.
