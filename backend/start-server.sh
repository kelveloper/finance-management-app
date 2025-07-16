#!/bin/bash

# Make sure the .env file exists
if [ ! -f .env ]; then
  echo "Error: .env file not found. Please create it with your Supabase credentials."
  exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Check if we should generate mock data
if [ "$1" == "--mock-data" ]; then
  echo "Generating mock data..."
  npx ts-node src/mock-data.ts
fi

# Start the development server
echo "Starting backend server..."
npm run dev