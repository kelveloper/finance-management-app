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
  subcategory TEXT,
  tag TEXT CHECK (tag IN ('essential', 'discretionary')),
  posted_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_posted_date ON transactions(posted_date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_subcategory ON transactions(subcategory);

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

-- Categorization Feedback Table (for machine learning)
CREATE TABLE IF NOT EXISTS categorization_feedback (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id TEXT NOT NULL,
  original_description TEXT NOT NULL,
  user_category TEXT NOT NULL,
  user_subcategory TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_categorization_feedback_transaction_id ON categorization_feedback(transaction_id);
CREATE INDEX IF NOT EXISTS idx_categorization_feedback_user_category ON categorization_feedback(user_category);

-- Add subcategory column to existing transactions table if it doesn't exist
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS subcategory TEXT;

-- Update categorization_feedback table to include subcategory if it doesn't exist
ALTER TABLE categorization_feedback ADD COLUMN IF NOT EXISTS user_subcategory TEXT; 