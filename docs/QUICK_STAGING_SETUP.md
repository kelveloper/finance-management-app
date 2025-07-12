# Quick Staging Setup (5 Minutes)

## Step 1: Copy Your Current Environment File

```bash
cd backend

# Rename your current .env to .env.development
cp .env .env.development

# Create staging environment file
cp .env .env.staging

# Create production environment file  
cp .env .env.production
```

## Step 2: Update Environment Files

### Edit `.env.development` (your current setup):
- Keep everything the same
- Add: `NODE_ENV=development` at the top

### Edit `.env.staging`:
- Change `SUPABASE_URL` to your new staging project URL
- Change `SUPABASE_ANON_KEY` to your new staging project key
- Add: `NODE_ENV=staging` at the top
- Keep `PLAID_ENV="sandbox"` (for safety)

### Edit `.env.production`:
- Change `SUPABASE_URL` to your new production project URL  
- Change `SUPABASE_ANON_KEY` to your new production project key
- Add: `NODE_ENV=production` at the top
- Change `PLAID_ENV="production"` (REAL bank data!)

## Step 3: Test It Works

```bash
# Test development (should work like before)
npm run dev

# Test staging (after you create staging Supabase project)
npm run dev:staging
```

You should see:
```
🌍 Environment: staging
📁 Config file: .env.staging
🔗 Supabase URL: https://your-staging-project.supabase.co
```

## Step 4: Create Staging Supabase Project

1. Go to [supabase.com](https://supabase.com/dashboard)
2. Click "New Project"
3. Name it `empowerflow-staging`
4. Copy the URL and anon key to your `.env.staging` file
5. Run the database schema (see `STAGING_SETUP.md`)

## You're Done! 🎉

Now you can:
- `npm run dev` = Development environment
- `npm run dev:staging` = Staging environment  
- `npm run start:production` = Production environment 