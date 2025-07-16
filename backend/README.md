# Backend Server Setup

This guide will help you set up and run the backend server for the finance management app.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account and project

## Setup Instructions

1. Create a `.env` file in the backend directory with your Supabase credentials:

```
# Supabase Configuration
SUPABASE_URL="https://your-project-ref.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"

# Optional: Direct Database URL (for advanced use cases)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

2. Install dependencies:

```bash
npm install
```

3. Create the required tables in your Supabase database:

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

4. Generate mock data (optional):

```bash
./start-server.sh --mock-data
```

5. Start the server:

```bash
./start-server.sh
```

## API Endpoints

### Get All Transactions

```
GET /api/data
```

Headers:
- `x-user-id`: User ID (defaults to 'dev_user_2025' if not provided)

Response:
```json
{
  "transactions": [...],
  "insights": {
    "anomalies": [],
    "recurring": [],
    "personalized": []
  }
}
```

### Update Transaction Tag

```
POST /api/transactions/:id/tag
```

Headers:
- `x-user-id`: User ID (defaults to 'dev_user_2025' if not provided)

Body:
```json
{
  "tag": "essential" // or "discretionary"
}
```

Response:
```json
{
  "message": "Transaction tag updated successfully.",
  "transaction": {...}
}
```

### Predict Tags for Transactions

```
GET /api/transactions/predict-tags
```

Headers:
- `x-user-id`: User ID (defaults to 'dev_user_2025' if not provided)

Response:
```json
{
  "message": "Successfully predicted tags for X transactions.",
  "predictions": {
    "transaction-id-1": "essential",
    "transaction-id-2": "discretionary",
    ...
  }
}
```

## Troubleshooting

### Supabase Connection Issues

If you see `supabaseKey is required` errors:
- Make sure your `.env` file has the correct `SUPABASE_ANON_KEY` value
- Restart the backend server after updating the `.env` file

### TypeScript Errors

If you encounter TypeScript errors:
- Run `npm run build` to check for compilation errors
- Make sure all required types are properly imported

### Database Issues

If you encounter database errors:
- Check that your Supabase project is set up correctly
- Verify that the required tables exist in your database
- Check that your Supabase URL and key are correct in the `.env` file