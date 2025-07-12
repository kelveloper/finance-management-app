# Environment Setup Instructions

## 🔐 Security Notice

**Important**: Environment files (`.env*`) contain sensitive credentials and are NOT committed to git for security reasons.

## 📋 Required Environment Files

You need to create these files in the `backend/` directory:

### 1. `.env.development`
```env
NODE_ENV=development
PORT=8000

# Supabase Development
SUPABASE_URL="https://your-dev-project.supabase.co"
SUPABASE_ANON_KEY="your-dev-anon-key"

# Plaid Development
PLAID_CLIENT_ID="your-plaid-client-id"
PLAID_SECRET="your-plaid-secret"
PLAID_ENV="sandbox"

# JWT Secret
JWT_SECRET="dev-jwt-secret-key-change-me"
```

### 2. `.env.staging`
```env
NODE_ENV=staging
PORT=8000

# Supabase Staging
SUPABASE_URL="https://your-staging-project.supabase.co"
SUPABASE_ANON_KEY="your-staging-anon-key"

# Plaid Staging (still sandbox for safety)
PLAID_CLIENT_ID="your-plaid-client-id"
PLAID_SECRET="your-plaid-secret"
PLAID_ENV="sandbox"

# JWT Secret
JWT_SECRET="staging-jwt-secret-key-change-me"
```

### 3. `.env.production`
```env
NODE_ENV=production
PORT=8000

# Supabase Production
SUPABASE_URL="https://your-prod-project.supabase.co"
SUPABASE_ANON_KEY="your-prod-anon-key"

# Plaid Production (REAL BANK DATA!)
PLAID_CLIENT_ID="your-plaid-client-id"
PLAID_SECRET="your-plaid-secret"
PLAID_ENV="production"

# JWT Secret
JWT_SECRET="super-secure-production-jwt-key-256-bit-minimum"
```

## 🚀 Quick Setup

1. **Copy your existing .env file** to all three environments:
   ```bash
   cd backend
   cp .env .env.development
   cp .env .env.staging
   cp .env .env.production
   ```

2. **Update each file** with the appropriate:
   - `NODE_ENV` value
   - Supabase project URL and keys
   - Plaid environment setting

3. **Test the setup**:
   ```bash
   npm run dev              # Development
   npm run dev:staging      # Staging
   npm run start:production # Production
   ```

## 🔒 Security Best Practices

- ✅ Environment files are in `.gitignore`
- ✅ Never commit real credentials to git
- ✅ Use different Supabase projects for each environment
- ✅ Keep staging on sandbox Plaid for safety
- ✅ Use strong JWT secrets for production

## 🆘 If You Need Help

1. Check existing `.env` file has all required variables
2. Verify Supabase credentials are correct
3. Test with: `npm run build` then `npm run dev`
4. See `docs/QUICK_STAGING_SETUP.md` for step-by-step guide 