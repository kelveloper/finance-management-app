import { categorizeTransactions, getSubcategoryStructure } from './categorize-transactions';

async function testSubcategories() {
  console.log('🧪 Testing Subcategory System...\n');
  
  // First, show the subcategory structure
  const structure = getSubcategoryStructure();
  console.log('📊 Subcategory Structure:');
  Object.entries(structure).forEach(([category, subcategories]) => {
    console.log(`  ${category}:`);
    Object.keys(subcategories).forEach(subcat => {
      console.log(`    - ${subcat}`);
    });
  });
  
  console.log('\n🤖 Running Smart Categorization with Subcategories...');
  
  try {
    const result = await categorizeTransactions();
    console.log('\n📈 Categorization Results:');
    console.log(`Total transactions processed: ${result.total}`);
    console.log(`Uncategorized: ${result.uncategorized}`);
    
    console.log('\n📊 Main Categories:');
    Object.entries(result.categorized).forEach(([category, count]) => {
      console.log(`  ${category}: ${count}`);
    });
    
    console.log('\n📊 Subcategories:');
    Object.entries(result.subcategorized).forEach(([subcategory, count]) => {
      console.log(`  ${subcategory}: ${count}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// testSubcategories(); // Commented out to prevent auto-execution 