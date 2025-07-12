import { supabase } from './supabase';
import { getSubcategoryStructure } from './categorize-transactions';

async function checkDatabaseSchema() {
  console.log('🔍 Checking database schema...');
  
  try {
    // Check if subcategory column exists
    const { data, error } = await supabase
      .from('transactions')
      .select('id, description, category, subcategory')
      .limit(1);
    
    if (error) {
      if (error.message.includes('subcategory does not exist')) {
        console.log('❌ Subcategory column does not exist yet');
        console.log('📋 Please run the SQL commands in your Supabase dashboard first');
        return false;
      }
      throw error;
    }
    
    console.log('✅ Subcategory column exists');
    return true;
  } catch (error) {
    console.error('Error checking schema:', error);
    return false;
  }
}

async function testSubcategoryStructure() {
  console.log('🧪 Testing Subcategory Structure...\n');
  
  const structure = getSubcategoryStructure();
  console.log('📊 Available Subcategories:');
  
  let totalSubcategories = 0;
  Object.entries(structure).forEach(([category, subcategories]) => {
    const subcatCount = Object.keys(subcategories).length;
    totalSubcategories += subcatCount;
    console.log(`  ${category} (${subcatCount} subcategories):`);
    Object.keys(subcategories).forEach(subcat => {
      console.log(`    - ${subcat}`);
    });
    console.log();
  });
  
  console.log(`📈 Total: ${Object.keys(structure).length} main categories, ${totalSubcategories} subcategories`);
}

async function testCategoryAPI() {
  console.log('\n🔗 Testing Categories API...');
  
  try {
    const response = await fetch('http://localhost:8000/api/categories');
    const data = await response.json();
    
    console.log('✅ Categories API response:');
    console.log(`  Main categories: ${data.categories.length}`);
    console.log(`  Subcategory structure: ${Object.keys(data.subcategories).length} categories`);
    
    // Test a few sample categorizations
    console.log('\n🤖 Testing sample categorizations:');
    const samples = [
      'STARBUCKS STORE #12345',
      'COINBASE.COM',
      'NETFLIX.COM',
      'UBER TRIP',
      'MCDONALD\'S #1234'
    ];
    
    // This would require implementing a test categorization endpoint
    console.log('Sample descriptions to test:');
    samples.forEach(sample => {
      console.log(`  - ${sample}`);
    });
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

async function main() {
  console.log('🚀 Starting Backend API Testing...\n');
  
  // First test the subcategory structure
  await testSubcategoryStructure();
  
  // Check if database schema is ready
  const schemaReady = await checkDatabaseSchema();
  
  if (!schemaReady) {
    console.log('\n⚠️  Database schema not ready. Please run the SQL commands first.');
    process.exit(1);
  }
  
  // Test the API endpoints
  await testCategoryAPI();
  
  console.log('\n✅ Backend testing complete!');
  console.log('🎯 Ready to test smart categorization with subcategories');
}

main().catch(console.error); 