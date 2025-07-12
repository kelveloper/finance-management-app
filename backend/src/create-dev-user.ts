import { supabase } from './supabase';

async function createDevelopmentUser() {
  console.log('🚀 Setting up development user for transactions...');
  
  const devUserId = 'dev_user_2025';
  
  try {
    // For development, we'll just ensure we can use this userID for transactions
    // We don't need to create a user in the users table if it's not required
    
    // Check if we have any existing transactions for this user
    const { data: existingTransactions } = await supabase
      .from('transactions')
      .select('user_id')
      .eq('user_id', devUserId)
      .limit(1);
    
    console.log(`📊 Found ${existingTransactions?.length || 0} existing transactions for dev user`);
    
    // Try to create user profile for the development user (optional)
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', devUserId)
      .single();
    
    if (!existingProfile) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([{
          id: devUserId,
          preferences: { theme: 'dark', currency: 'USD' },
          financial_personality: { type: 'balanced', impulse_score: 5 },
          learning_data: { categories_learned: [] },
          created_at: new Date().toISOString()
        }]);
      
      if (profileError) {
        console.log('⚠️  User profile not needed for basic functionality');
      } else {
        console.log('✅ Development user profile created');
      }
    } else {
      console.log('✅ Development user profile already exists');
    }
    
    console.log('✅ Development setup ready! Using userID:', devUserId);
    return true;
    
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  createDevelopmentUser().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

export { createDevelopmentUser }; 