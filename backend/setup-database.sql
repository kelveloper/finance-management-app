-- EmpowerFlow Database Setup Script
-- Run this in your Supabase SQL Editor

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
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
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_posted_date ON transactions(posted_date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);

-- User Profiles Table (for advanced AI features)
CREATE TABLE IF NOT EXISTS user_profiles (
  id TEXT PRIMARY KEY,
  preferences JSONB,
  financial_personality JSONB,
  learning_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON user_profiles(id); 