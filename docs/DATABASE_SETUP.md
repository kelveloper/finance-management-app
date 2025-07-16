# Database Setup Guide

This project uses **Supabase** as the primary database system, providing a robust PostgreSQL database with real-time capabilities and secure authentication.

---

## Supabase Configuration

The application connects to Supabase using the official `@supabase/supabase-js` client, configured through environment variables.

### Required Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Supabase Configuration
SUPABASE_URL="https://your-project-ref.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"

# Plaid API Configuration (for bank data integration)
PLAID_CLIENT_ID="your-plaid-client-id"
PLAID_SECRET="your-plaid-secret"
PLAID_ENV="sandbox"  # or "development" or "production"

# Optional: Direct Database URL (for advanced use cases)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

### How to Get Supabase Credentials

1. **Create a Supabase Project**: Go to [supabase.com](https://supabase.com) and create a new project
2. **Get Project URL**: Found in Project Settings → API → Project URL
3. **Get Anon Key**: Found in Project Settings → API → Project API keys → `anon` `public`

### Database Schema

The application expects the following table structure in your Supabase database:

#### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
```

#### Transactions Table

```sql
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  account_id TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
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

### Setup Instructions

1. **Install Dependencies**: Ensure you have the Supabase client installed

   ```bash
   cd backend
   npm install @supabase/supabase-js
   ```

2. **Configure Environment**: Create the `.env` file with your Supabase credentials

3. **Create Database Schema**: Run the SQL schema in your Supabase dashboard (SQL Editor)

4. **Import Data**: Use the sync script to import CSV data

   ```bash
   npm run sync
   ```

5. **Start Backend**: Run the backend server
   ```bash
   npm run start
   ```

### Data Import

To import Chase CSV data into Supabase:

```bash
# Place your CSV file in the env/ directory
# Then run the sync script
npm run sync
```

This will parse the CSV file and insert transactions into your Supabase database.

### Connection Verification

The backend will log the connection status on startup:

```
EmpowerFlow backend listening on port 8000, connected to Supabase.
```

### Security Notes

- **Environment Variables**: Never commit `.env` files to version control
- **CSV Data**: Store sensitive financial data in the `env/` folder (excluded from git)
- **API Keys**: Use the `anon` key for client-side operations, keep the `service_role` key secure
- **Row Level Security**: Consider enabling RLS policies in Supabase for production use

### Development vs Production

- **Development**: Use Supabase's free tier with test data
- **Production**: Upgrade to Supabase Pro for production workloads
- **Data**: Always use sample/test data during development, never real financial information
