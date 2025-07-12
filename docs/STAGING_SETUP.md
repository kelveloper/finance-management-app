# Staging Environment Setup Guide

This guide explains how to set up a staging environment for your finance management app to safely test changes before deploying to production.

## Why Staging Environment?

**Staging = Production Rehearsal** 🎭
- Test with real-like data without affecting live users
- Catch bugs before they reach production
- Test deployments and migrations safely
- Share features with stakeholders for feedback

---

## Step 1: Create Multiple Supabase Projects

You'll need three Supabase projects:

| Environment | Project Name | Purpose |
|-------------|--------------|---------|
| **Development** | `empowerflow-dev` | Your current project for daily coding |
| **Staging** | `empowerflow-staging` | Testing before production |
| **Production** | `empowerflow-prod` | Live app for real users |

### Create New Projects:
1. Go to [supabase.com](https://supabase.com/dashboard)
2. Click "New Project" 
3. Create `empowerflow-staging`
4. Create `empowerflow-production`

### Copy Database Schema:
For each new project, go to SQL Editor and run:

```sql
-- Copy this to both staging and production projects
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

---

## Step 2: Update Environment Configuration

### Current Setup (Single Environment):
```
backend/.env
```

### New Setup (Multiple Environments):
```
backend/
├── .env.development     # Your current .env renamed
├── .env.staging        # New staging config
├── .env.production     # New production config
└── .env               # Points to current environment
```

### Create Environment Files:

**backend/.env.development:**
```env
# Development Environment
NODE_ENV=development
PORT=8000

# Supabase Development
SUPABASE_URL="https://your-dev-project.supabase.co"
SUPABASE_ANON_KEY="your-dev-anon-key"

# Plaid Development
PLAID_CLIENT_ID="your-plaid-client-id"
PLAID_SECRET="your-plaid-secret"
PLAID_ENV="sandbox"

# JWT
JWT_SECRET="dev-jwt-secret-key"
```

**backend/.env.staging:**
```env
# Staging Environment
NODE_ENV=staging
PORT=8000

# Supabase Staging
SUPABASE_URL="https://your-staging-project.supabase.co"
SUPABASE_ANON_KEY="your-staging-anon-key"

# Plaid Staging (still sandbox for safety)
PLAID_CLIENT_ID="your-plaid-client-id"
PLAID_SECRET="your-plaid-secret"
PLAID_ENV="sandbox"

# JWT
JWT_SECRET="staging-jwt-secret-key"
```

**backend/.env.production:**
```env
# Production Environment
NODE_ENV=production
PORT=8000

# Supabase Production
SUPABASE_URL="https://your-prod-project.supabase.co"
SUPABASE_ANON_KEY="your-prod-anon-key"

# Plaid Production (REAL BANK DATA!)
PLAID_CLIENT_ID="your-plaid-client-id"
PLAID_SECRET="your-plaid-secret"
PLAID_ENV="production"

# JWT
JWT_SECRET="super-secure-production-jwt-key"
```

---

## Step 3: Update Backend Code for Environment Switching

### Update `backend/src/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment-specific config
const environment = process.env.NODE_ENV || 'development';
const envFile = `.env.${environment}`;

dotenv.config({ path: path.resolve(__dirname, `../${envFile}`) });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(`Supabase credentials missing in ${envFile}`);
}

console.log(`🌍 Environment: ${environment}`);
console.log(`📁 Config file: ${envFile}`);
console.log(`🔗 Supabase URL: ${supabaseUrl}`);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Update `backend/package.json` scripts:

```json
{
  "scripts": {
    "dev": "NODE_ENV=development nodemon src/index.ts",
    "dev:staging": "NODE_ENV=staging nodemon src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "start:staging": "NODE_ENV=staging node dist/index.js",
    "start:production": "NODE_ENV=production node dist/index.js",
    "test": "jest",
    "sync": "NODE_ENV=development ts-node src/sync-chase-csv.ts",
    "sync:staging": "NODE_ENV=staging ts-node src/sync-chase-csv.ts"
  }
}
```

---

## Step 4: Test Your Staging Environment

### 1. Start Backend in Staging Mode:
```bash
cd backend
npm run dev:staging
```

You should see:
```
🌍 Environment: staging
📁 Config file: .env.staging
🔗 Supabase URL: https://your-staging-project.supabase.co
EmpowerFlow backend listening on port 8000, connected to Supabase.
```

### 2. Upload Test Data to Staging:
```bash
# Copy some sample CSV data to env/ folder
npm run sync:staging
```

### 3. Test API Endpoints:
```bash
# Test that staging API returns data
curl http://localhost:8000/api/data
```

---

## Step 5: Frontend Environment Configuration

### Update `app.json` for multiple environments:

```json
{
  "expo": {
    "name": "EmpowerFlow",
    "slug": "empowerflow-finance",
    "version": "1.0.0",
    "extra": {
      "eas": {
        "projectId": "your-expo-project-id"
      }
    }
  }
}
```

### Create `eas.json` for staging builds:

```json
{
  "cli": {
    "version": ">= 0.52.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "staging": {
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_API_URL": "https://your-staging-backend.com"
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://your-production-backend.com"
      }
    }
  }
}
```

---

## Step 6: Deploy Staging Backend

### Option A: Vercel (Recommended for beginners)

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Deploy to staging:**
```bash
cd backend
vercel --prod --env NODE_ENV=staging
```

### Option B: Railway

1. **Connect to Railway:**
```bash
npm install -g @railway/cli
railway login
```

2. **Deploy staging:**
```bash
railway up --environment staging
```

---

## Step 7: Testing Workflow

### Daily Development:
```bash
# Work on your local machine
npm run dev                    # Uses development database
```

### Before Deploying to Users:
```bash
# Test on staging first
npm run dev:staging           # Test backend with staging database
expo start --release-channel staging  # Test mobile app
```

### When Ready for Users:
```bash
# Deploy to production
npm run start:production      # Production backend
expo start --release-channel production  # Live mobile app
```

---

## Benefits You'll Get

### 🛡️ **Safety**
- Never break the live app
- Test with realistic data
- Catch integration issues early

### 🚀 **Confidence**
- Share features with stakeholders
- Test deployment process
- Validate performance at scale

### 🔄 **Better Workflow**
```
Code → Test Locally → Test on Staging → Deploy to Production
```

### 💰 **Cost Management**
- Staging uses same free Supabase tier
- Only pay for production resources
- No surprise costs

---

## Common Staging Scenarios for Your Finance App

### Scenario 1: New CSV Parser
```bash
# Test new Chase CSV format on staging
npm run sync:staging          # Upload test data
# Verify categorization works
# Check AI insights are generated
```

### Scenario 2: New Mobile Feature
```bash
expo start --release-channel staging
# Test on real device
# Share with beta testers
# Collect feedback before production
```

### Scenario 3: Database Migration
```bash
# Run migration on staging first
# Verify data integrity
# Then run on production with confidence
```

---

## Next Steps

1. **✅ Create staging Supabase project**
2. **✅ Set up environment files** 
3. **✅ Test staging backend locally**
4. **✅ Deploy staging backend to cloud**
5. **✅ Build staging mobile app**
6. **✅ Document staging workflow for your team**

Once staging is working, you'll never want to deploy directly to production again! 🎉 