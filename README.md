# Finance Management App

A comprehensive finance management application built with React Native (Expo) for the frontend and Express/TypeScript for the backend.

## Features

- Transaction management with essential/optional tagging
- Transaction categorization
- Financial insights and analytics
- User-friendly mobile interface

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a `.env` file with your Supabase credentials:
   ```
   # Supabase Configuration
   SUPABASE_URL="https://your-project-ref.supabase.co"
   SUPABASE_ANON_KEY="your-anon-key"

   # Optional: Direct Database URL (for advanced use cases)
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Create the required tables in your Supabase database:

   Run the following SQL in your Supabase SQL Editor:

   ```sql
   CREATE TABLE transactions (
     id TEXT PRIMARY KEY,
     user_id TEXT NOT NULL,
     account_id TEXT NOT NULL,
     amount DECIMAL NOT NULL,
     description TEXT NOT NULL,
     category TEXT,
     subcategory TEXT,
     tag TEXT CHECK (tag IN ('essential', 'discretionary')),
     posted_date DATE NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create indexes for better performance
   CREATE INDEX idx_transactions_user_id ON transactions(user_id);
   CREATE INDEX idx_transactions_posted_date ON transactions(posted_date);
   CREATE INDEX idx_transactions_category ON transactions(category);
   ```

5. Generate mock data (optional):
   ```
   ./start-server.sh --mock-data
   ```

6. Start the backend server:
   ```
   ./start-server.sh
   ```
   or
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to the root directory and install dependencies:
   ```
   npm install
   ```

2. Start the Expo development server:
   ```
   npx expo start
   ```

3. Open the app in your preferred environment:
   - Press `w` to open in a web browser
   - Press `i` to open in an iOS simulator (requires Xcode)
   - Press `a` to open in an Android emulator (requires Android Studio)
   - Scan the QR code with the Expo Go app on your physical device

## Essential/Optional Tagging Feature

The app includes a feature to tag transactions as either "Essential" or "Optional" (discretionary):

1. Each transaction has individual loading states when updating its tag
2. Only the specific transaction being updated shows the loading state
3. Other transactions remain interactive during updates
4. Visual feedback shows the currently selected tag (Essential or Optional)
5. Buttons are disabled during loading to prevent multiple clicks

## Troubleshooting

### Backend Connection Issues

If you see `ERR_CONNECTION_REFUSED` errors in the frontend:
- Make sure the backend server is running on port 8000
- Check that your `.env` file has the correct Supabase credentials
- Verify that the API URL in the frontend is pointing to the correct backend URL

### Supabase Connection Issues

If you see `supabaseKey is required` errors:
- Make sure your `.env` file has the correct `SUPABASE_ANON_KEY` value
- Restart the backend server after updating the `.env` file

### TypeScript Errors

If you encounter TypeScript errors:
- Run `npm run build` to check for compilation errors
- Make sure all required types are properly imported

## Database Schema

See the [Database Setup Guide](docs/DATABASE_SETUP.md) for details on the required database schema and setup instructions.

## Backend API Documentation

See the [Backend README](backend/README.md) for detailed API documentation.