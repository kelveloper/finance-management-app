import { supabase } from './supabase';
import * as fs from 'fs';
import * as path from 'path';

async function setupDatabase() {
  console.log('🚀 Checking database setup...');
  
  try {
    // Test if transactions table exists by querying it
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .limit(1);
    
    if (error && error.message.includes('relation "transactions" does not exist')) {
      console.log('❌ Database tables not found.');
      console.log('📋 Please run the following SQL in your Supabase SQL Editor:');
      console.log('🔗 Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new');
      console.log('---');
      
      const sqlFile = fs.readFileSync(path.join(__dirname, '../setup-database.sql'), 'utf8');
      console.log(sqlFile);
      console.log('---');
      
      return false;
    } else if (error) {
      console.error('❌ Database connection error:', error);
      return false;
    } else {
      console.log('✅ Database tables exist and are accessible!');
      console.log(`📊 Found ${data?.length || 0} existing transactions`);
      return true;
    }
    
  } catch (error) {
    console.error('❌ Database setup error:', error);
    return false;
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

export { setupDatabase }; 