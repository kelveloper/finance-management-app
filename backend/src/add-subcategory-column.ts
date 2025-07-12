import { supabase } from './supabase';

async function addSubcategoryColumn() {
  console.log('🔧 Adding subcategory column to database...');
  
  try {
    // Add subcategory column to transactions table
    const { error: alterError } = await supabase.rpc('sql', {
      query: 'ALTER TABLE transactions ADD COLUMN IF NOT EXISTS subcategory TEXT;'
    });
    
    if (alterError) {
      console.error('Error adding subcategory column:', alterError);
      // Try alternative approach
      console.log('Trying alternative approach...');
      
      // Create index for subcategory if column exists
      const { error: indexError } = await supabase.rpc('sql', {
        query: 'CREATE INDEX IF NOT EXISTS idx_transactions_subcategory ON transactions(subcategory);'
      });
      
      if (indexError) {
        console.error('Error creating index:', indexError);
      } else {
        console.log('✅ Subcategory index created (column may already exist)');
      }
    } else {
      console.log('✅ Subcategory column added successfully');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

addSubcategoryColumn(); 