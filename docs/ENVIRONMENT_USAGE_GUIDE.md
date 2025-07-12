# Environment Usage Guide - Concrete Examples

This guide shows you **exactly** how to use Development, Staging, and Production environments with real examples.

## 🏗️ **The Three Environments Explained**

| Environment | Purpose | When to Use | Data Type |
|-------------|---------|-------------|-----------|
| **Development** | Daily coding | Building features | Fake/test data |
| **Staging** | Pre-production testing | Before going live | Realistic test data |
| **Production** | Live app | Real users | Real user data |

---

## 🎯 **How to Use Each Environment**

### **Development Environment (Daily Work)**

**Use Case**: You're building a new feature like "Budget Alerts"

```bash
# Terminal 1: Start backend in development
cd backend
npm run dev

# You'll see:
# 🌍 Environment: development
# 📁 Config loaded from: /path/to/.env.development
# 🔗 Supabase URL: https://your-dev-project.supabase.co
# Backend server is running on http://0.0.0.0:8000
```

```bash
# Terminal 2: Start frontend (from root directory)
cd ..  # Go back to root
npm run dev

# You'll see the Expo QR code
# Scan with your phone to test the app
```

**What happens**: 
- Backend connects to your development Supabase database
- Frontend shows your local changes in real-time
- You can test new features without affecting other environments

---

### **Staging Environment (Pre-Production Testing)**

**Use Case**: You finished the "Budget Alerts" feature and want to test it like real users would

```bash
# Terminal 1: Start backend in staging
cd backend
npm run dev:staging

# You'll see:
# 🌍 Environment: staging
# 📁 Config loaded from: /path/to/.env.staging
# 🔗 Supabase URL: https://your-staging-project.supabase.co
# Backend server is running on http://0.0.0.0:8000
```

```bash
# Terminal 2: Start frontend (from root directory)
cd ..  # Go back to root
npm run dev

# For mobile testing:
expo start --release-channel staging
```

**What happens**:
- Backend connects to staging Supabase database
- You test with realistic data (but not real user data)
- Perfect for showing features to stakeholders
- Catches bugs before production

---

### **Production Environment (Live App)**

**Use Case**: Budget Alerts feature is tested and ready for real users

```bash
# Deploy backend to production
cd backend
npm run build
npm run start:production

# You'll see:
# 🌍 Environment: production
# 📁 Config loaded from: /path/to/.env.production
# 🔗 Supabase URL: https://your-prod-project.supabase.co
# Backend server is running on http://0.0.0.0:8000
```

```bash
# Deploy frontend to production
cd ..  # Go back to root
expo build:android --release-channel production
expo build:ios --release-channel production
```

**What happens**:
- Backend connects to production Supabase database
- Real users get the new Budget Alerts feature
- App Store/Play Store users see the update

---

## 🔄 **Real-World Workflow Examples**

### **Example 1: Adding Support for Bank of America CSV**

**Step 1 - Development** (Your daily work)
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend  
npm run dev
```

**What you do**:
- Code the BofA CSV parser
- Test with fake BofA CSV file
- Upload test data: `npm run sync`
- Verify categories work correctly

---

**Step 2 - Staging** (Before going live)
```bash
# Terminal 1: Backend
cd backend
npm run dev:staging

# Terminal 2: Frontend
npm run dev
```

**What you do**:
- Get a real BofA CSV file (anonymized)
- Upload to staging: `npm run sync:staging`
- Test the full user flow
- Share with stakeholders: "Hey, check out this new feature!"

---

**Step 3 - Production** (Go live)
```bash
# Deploy to production
cd backend
npm run build
npm run start:production

# Deploy mobile app
expo publish --release-channel production
```

**What happens**:
- Real users can now upload BofA CSV files
- Feature is live and working

---

### **Example 2: Fixing a Critical Bug**

**The Problem**: Users report transaction amounts are wrong

**Step 1 - Reproduce in Development**
```bash
cd backend
npm run dev

# Test with the problematic data
# Find the bug in your code
```

**Step 2 - Test Fix in Staging**
```bash
cd backend
npm run dev:staging

# Test the fix with realistic data
# Make sure it actually works
```

**Step 3 - Deploy Fix to Production**
```bash
cd backend
npm run build
npm run start:production

# Users get the fix immediately
```

---

## 📱 **Frontend Environment Examples**

### **Development Frontend**
```bash
# Basic development
npm run dev

# For web testing
npm run web

# For mobile testing
npm run android
npm run ios
```

### **Staging Frontend**
```bash
# Create staging build
expo build:android --release-channel staging
expo build:ios --release-channel staging

# Or for testing
expo start --release-channel staging
```

### **Production Frontend**
```bash
# Create production builds
expo build:android --release-channel production
expo build:ios --release-channel production

# Or publish update
expo publish --release-channel production
```

---

## 🔍 **Environment-Specific Data Management**

### **Development Data**
```bash
# Upload test CSV data
cd backend
npm run sync

# What this does:
# - Reads CSV from env/ folder
# - Uploads to development database
# - Safe to experiment with
```

### **Staging Data**
```bash
# Upload realistic test data
cd backend
npm run sync:staging

# What this does:
# - Reads CSV from env/ folder
# - Uploads to staging database
# - Use realistic but anonymized data
```

### **Production Data**
```bash
# Users upload their own data through the app
# Never manually sync to production
# Real financial data only
```

---

## 🚨 **Common Mistakes & Solutions**

### **Mistake 1**: Running wrong command from wrong directory
```bash
# ❌ Wrong
cd backend
npm run dev:staging  # This won't work from root

# ✅ Correct
cd backend
npm run dev:staging  # Backend staging
cd ..
npm run dev          # Frontend from root
```

### **Mistake 2**: Using production data in development
```bash
# ❌ Wrong
# Using real bank statements in development

# ✅ Correct
# Use fake/anonymized data in development
# Use realistic test data in staging
# Only real data in production
```

### **Mistake 3**: Forgetting to test on staging
```bash
# ❌ Wrong workflow
Development → Production (risky!)

# ✅ Correct workflow
Development → Staging → Production (safe!)
```

---

## 🎯 **Quick Reference Commands**

### **Backend Commands**
```bash
cd backend

# Development
npm run dev              # Development server
npm run sync             # Upload test data

# Staging  
npm run dev:staging      # Staging server
npm run sync:staging     # Upload staging data

# Production
npm run start:production # Production server
```

### **Frontend Commands**
```bash
# From root directory

# Development
npm run dev              # Expo development
npm run web              # Web development
npm run android          # Android development
npm run ios              # iOS development

# Staging/Production
expo start --release-channel staging
expo start --release-channel production
```

---

## 📊 **Environment Status Check**

### **Check Which Environment You're In**
```bash
cd backend
node -e "console.log('Environment:', process.env.NODE_ENV || 'development')"

# Development
NODE_ENV=development node -e "const { supabase } = require('./dist/backend/src/supabase.js');"

# Staging
NODE_ENV=staging node -e "const { supabase } = require('./dist/backend/src/supabase.js');"

# Production
NODE_ENV=production node -e "const { supabase } = require('./dist/backend/src/supabase.js');"
```

---

## 🎉 **Success Indicators**

### **Development Working**
```
🌍 Environment: development
📁 Config loaded from: /path/to/.env.development
🔗 Supabase URL: https://your-dev-project.supabase.co
Backend server is running on http://0.0.0.0:8000
```

### **Staging Working**
```
🌍 Environment: staging
📁 Config loaded from: /path/to/.env.staging
🔗 Supabase URL: https://your-staging-project.supabase.co
Backend server is running on http://0.0.0.0:8000
```

### **Production Working**
```
🌍 Environment: production
📁 Config loaded from: /path/to/.env.production
🔗 Supabase URL: https://your-prod-project.supabase.co
Backend server is running on http://0.0.0.0:8000
```

---

## 🚀 **Next Steps**

1. **Try each environment** with the examples above
2. **Create your workflow** based on your needs
3. **Test the staging environment** before any production deploy
4. **Share staging with stakeholders** to get feedback

**Remember**: Development → Staging → Production is your safety net! 🛡️ 